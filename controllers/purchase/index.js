"use strict";

const { Purchase, Supplier, Product } = require("../../database/models");

// CREATE
const create = async (req, res) => {
    try {
        const { productId ,totalItems} = req.body;

        if (!productId) {
            return res.status(400).json({ message: "productId is required" });
        }
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(400).json({ message: "Invalid productId: product not found" });
        }
        if (product.status !== "active") {
            return res
                .status(400)
                .json({ message: "Cannot create purchase for an inactive product" });
        }
        if (totalItems == null || Number(totalItems) < 0) {
            return res.status(400).json({ message: "totalItems must be ≥ 0" });
        }
        const purchase = await Purchase.create(req.body);

        return res.status(201).json({
            message: "Purchase created successfully",
            data: purchase,
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error creating purchase",
            error: error.message,
        });
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                { model: Supplier, as: "supplier" },
                { model: Product, as: "product" },
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data: purchases });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching purchases",
            error: error.message,
        });
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id, {
            include: [
                { model: Supplier, as: "supplier" },
                { model: Product, as: "product" },
            ],
        });

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        return res.status(200).json({ data: purchase });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching purchase",
            error: error.message,
        });
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id);

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }
        if (req.body.productId !== undefined) {
            const product = await Product.findByPk(req.body.productId);
            if (!product) {
                return res.status(400).json({ message: "Invalid productId: product not found" });
            }
            if (product.status !== "active") {
                return res
                    .status(400)
                    .json({ message: "Cannot set purchase to an inactive product" });
            }
        }

        await purchase.update(req.body);

        return res.status(200).json({
            message: "Purchase updated successfully",
            data: purchase,
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error updating purchase",
            error: error.message,
        });
    }
};

// DELETE
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id);

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        await purchase.destroy();

        return res.status(200).json({ message: "Purchase deleted successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting purchase",
            error: error.message,
        });
    }
};

module.exports = { create, getAll, getOne, update, destroy };
