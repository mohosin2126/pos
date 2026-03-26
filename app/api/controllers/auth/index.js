"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Role } = require("../../database/models");

const {

    unauthorized: unauthorizedFromUtils,
    forbidden: forbiddenFromUtils, unprocessable, success, serverError, notFound,
} = require("../../utils/api-response");

const unauthorized =
    unauthorizedFromUtils ||
    ((res, message = "Unauthorized") =>
        res.status(401).json({ success: false, message }));

const forbidden =
    forbiddenFromUtils ||
    ((res, message = "Forbidden") =>
        res.status(403).json({ success: false, message }));


const login = async (req, res) => {
    try {
        const { email, password, remember = false } = req.body || {};
        console.log(remember);
        console.log(email);
        console.log(password);
        if (!email || !password) {
            return unprocessable(res, "Validation failed.", [
                "email and password are required",
            ]);
        }

        let user = await User.findOne({
            where: { email: email },
            include: [{ model: Role, as: "roleData", attributes: ["id", "name", "permissions"] }],
        });
        if (!user) {
            user = await User.findOne({
                where: { username: email },
                include: [{ model: Role, as: "roleData", attributes: ["id", "name", "permissions"] }],
            });
        }
        if (!user) {
            return unauthorized(res, "Invalid credentials");
        }

        if (user.isActive === false) {
            return forbidden(res, "Account inactive. Please contact support.");
        }
        if (user.allowLogin === false) {
            return forbidden(res, "Login not allowed for this account.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return unauthorized(res, "Invalid credentials");
        }

        const roleName = user.roleData?.name || "unknown";
        const permissions = user.roleData?.permissions || [];

        const token = jwt.sign(
            {
                id: user.id,
                role: roleName,
                permissions: permissions,
                email: user.email,
                username: user.username,
            },
            process.env.JWT_SECRET || "change-me-in-env",
            { expiresIn: remember ? "30d" : "7d" }
        );


        return success(res, "Login successful", { token });
    } catch (err) {
        return serverError(res, "Failed to login.", err);
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return unauthorized(res, "Unauthorized");

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
            include: [{ model: Role, as: "roleData", attributes: ["id", "name", "permissions"] }],
        });
        if (!user) return notFound(res, "User not found.");

        const userData = user.toJSON();
        userData.role = userData.roleData?.name || "unknown";
        userData.permissions = userData.roleData?.permissions || [];
        delete userData.roleData;

        return success(res, "Profile fetched successfully", userData);
    } catch (err) {
        return serverError(res, "Failed to fetch profile.", err);
    }
};


const logout = async (req, res) => {
    try {
        return success(res, "Logged out", null);
    } catch (err) {
        return serverError(res, "Failed to logout.", err);
    }
};

module.exports = { login, getProfile, logout };
