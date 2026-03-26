"use strict";

const { Category } = require("../../database/models");
const {created, serverError, success, notFound} = require("../../utils/api-response");

const create = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return created(res, "Category created successfully", category);
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

const getAll = async (req, res) => {
    try {
        const categories = await Category.findAll();
        return success(res, "Success", categories);
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

const getOne = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return notFound(res, "Category not found");
        return success(res, "Success", category);
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

const update = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return notFound(res, "Category not found");

        await category.update(req.body);
        return success(res, "Category updated successfully", category);
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

const destroy = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return notFound(res, "Category not found");

        await category.destroy();
        return success(res, "Category deleted", null);
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

module.exports = { create, getAll, getOne, update, destroy };
