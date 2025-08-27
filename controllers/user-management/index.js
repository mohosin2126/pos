"use strict";

const { User } = require("../../database/models");
const bcrypt = require("bcrypt");
const { createUserValidation } = require("./validation");

const {
    success,
    created,
    conflict,
    notFound,
    unprocessable,
    serverError,
    parsePagination,
    paginated,
} = require("../../utils/api-response");

const hashIfPresent = async (password) => {
    if (!password) return undefined;
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

// CREATE
const create = async (req, res) => {
    try {
        const { error, value } = createUserValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            return unprocessable(res, "Validation failed.", error.details.map((d) => d.message));
        }

        if (value.password) value.password = await hashIfPresent(value.password);

        const user = await User.create(value);
        return created(res, "User created successfully", user);
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return conflict(res, "Email or username already exists.", err.errors?.map((e) => e.message));
        }
        return serverError(res, "Failed to create user.", err);
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, {
            page: 1,
            limit: 20,
            maxLimit: 100,
        });

        const { rows, count } = await User.findAndCountAll({
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch users.", err);
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return notFound(res, "User not found.");
        return success(res, "Success", user);
    } catch (err) {
        return serverError(res, "Failed to fetch user.", err);
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        if (data.password) data.password = await hashIfPresent(data.password);
        else delete data.password;

        const [count] = await User.update(data, { where: { id } });
        if (!count) return notFound(res, "User not found.");

        const updated = await User.findByPk(id);
        return success(res, "User updated successfully", updated);
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return conflict(res, "Email or username already exists.", err.errors?.map((e) => e.message));
        }
        return serverError(res, "Failed to update user.", err);
    }
};

// DESTROY
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await User.destroy({ where: { id } });
        if (!count) return notFound(res, "User not found.");
        return success(res, "User deleted", null);
    } catch (err) {
        return serverError(res, "Failed to delete user.", err);
    }
};

module.exports = { create, getAll, getOne, update, destroy };
