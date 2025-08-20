"use strict";

const {Category} = require("../../database/models");

// CREATE
const create = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return res.status(201).json(category);
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const categories = await Category.findAll();
        return res.json(categories);
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({message: "Category not found"});
        return res.json(category);
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({message: "Category not found"});

        await category.update(req.body);
        return res.json(category);
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

// DESTROY
const destroy = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({message: "Category not found"});

        await category.destroy();
        return res.json({message: "Category deleted"});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

module.exports = {create, getAll, getOne, update, destroy};
