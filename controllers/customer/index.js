"use strict";

const { Customer } = require("../../database/models");

// GET ALL
const getAll = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        return res.json(customers);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        return res.json(customer);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getOne };
