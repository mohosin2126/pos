"use strict";

const { Invoice } = require("../../database/models");

// GET ALL
const getAll = async (req, res) => {
    try {
        const invoices = await Invoice.findAll();
        return res.json(invoices);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        return res.json(invoice);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getOne };
