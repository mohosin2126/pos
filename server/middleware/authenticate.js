"use strict";

const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || "";
        const [, token] = auth.split(" ");

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: Missing token" });
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET || "change-me-in-env"
        );

        req.user = {
            id: payload.id,
            role: payload.role,
            permissions: payload.permissions || [],
            email: payload.email,
            username: payload.username,
        };

        next();
    } catch {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: Invalid token" });
    }
};
