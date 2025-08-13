"use strict";

const { Supplier } = require("../../database/models");

// CREATE
const create = async (req, res) => {
    try {
        const value = req.body || {};

        if (!value.supplierCode || String(value.supplierCode).trim() === "") {
            return res.status(400).json({ message: "supplierCode is required" });
        }

        const exists = await Supplier.findOne({
            where: { supplierCode: value.supplierCode },
        });
        if (exists) {
            return res.status(409).json({ message: "Supplier code already in use" });
        }

        const created = await Supplier.create(value, { fields: Object.keys(value) });

        return res
            .status(201)
            .json({ message: "Supplier created successfully", data: created });
    } catch (err) {
        return res
            .status(500)
            .json({ message: err.message || "Something went wrong" });
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.max(parseInt(req.query.limit || "20", 10), 1);
        const offset = (page - 1) * limit;

        const where = {};
        const allowedFilters = [
            "status",
            "supplierCode",
            "companyName",
            "contactPersonName",
            "email",
            "phone",
            "country",
        ];
        for (const key of allowedFilters) {
            if (req.query[key] !== undefined && String(req.query[key]).trim() !== "") {
                where[key] = String(req.query[key]).trim();
            }
        }

        const { rows, count } = await Supplier.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return res.json({
            data: rows,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch suppliers" });
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid supplier id" });

        const supplier = await Supplier.findByPk(id);
        if (!supplier) return res.status(404).json({ message: "Supplier not found" });

        return res.json({ data: supplier });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch supplier" });
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid supplier id" });

        if (req.body.supplierCode !== undefined) {
            return res.status(400).json({ message: "supplierCode cannot be updated" });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No fields provided for update" });
        }

        const [affected] = await Supplier.update(req.body, { where: { id } });
        if (!affected) return res.status(404).json({ message: "Supplier not found" });

        const updated = await Supplier.findByPk(id);
        return res.json({ message: "Supplier updated successfully", data: updated });
    } catch (err) {
        return res.status(500).json({ message: "Failed to update supplier" });
    }
};

// DESTROY
const destroy = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid supplier id" });

        const deleted = await Supplier.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ message: "Supplier not found" });

        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete supplier" });
    }
};

module.exports = { create, getAll, getOne, update, destroy };
