"use strict";

const { Supplier, Category, Product } = require("../../database/models");
const {notFound, success, serverError} = require("../../utils/api-response");


const getAllSupplier = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            attributes: ["id", "companyName"],
            order: [["companyName", "ASC"]],
        });

        if (!suppliers || suppliers.length === 0) {
            return notFound(res, "No suppliers found");
        }

        return success(res, "Success", suppliers);
    } catch (error) {
        return serverError(res, "Failed to fetch supplier list", error);
    }
};

const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });

        if (!categories || categories.length === 0) {
            return notFound(res, "No categories found");
        }

        return success(res, "Success", categories);
    } catch (error) {
        return serverError(res, "Failed to fetch category list", error);
    }
};

const getAllProduct = async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });

        if (!products || products.length === 0) {
            return notFound(res, "No products found");
        }

        return success(res, "Success", products);
    } catch (error) {
        return serverError(res, "Failed to fetch product list", error);
    }
};

module.exports = { getAllSupplier, getAllCategory, getAllProduct };
