"use strict";

const { Supplier, Category, Product } = require("../../database/models");

const getAllSupplier = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            attributes: ["id", "companyName"],
            order: [["companyName", "ASC"]],
        });

        if (!suppliers || suppliers.length === 0) {
            return res.status(404).json({ message: "No suppliers found" });
        }

        return res.json({ data: suppliers });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch supplier list",
            error: error.message,
        });
    }
};

const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });

        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }

        return res.json({ data: categories });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch category list",
            error: error.message,
        });
    }
};

const getAllProduct = async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        return res.json({ data: products });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch product list",
            error: error.message,
        });
    }
};

module.exports = { getAllSupplier, getAllCategory, getAllProduct };
