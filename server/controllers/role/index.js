const {Role} = require("../../database/models");

// CREATE
const create = async (req, res) => {
    try {
        const {name, permissions} = req.body;

        if (!name) {
            return res.status(400).json({message: "Role name is required"});
        }

        const existing = await Role.findOne({where: {name}});
        if (existing) {
            return res.status(409).json({message: "Role name already exists"});
        }

        const role = await Role.create({
            name,
            permissions: permissions || [
                "view_dashboard",
                "manage_users",
                "assign_roles",
                "view_reports",
                "edit_profile",
            ],
        });

        return res.status(201).json({message: "Role created successfully", role});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const roles = await Role.findAll({
            order: [["id", "ASC"]],
        });
        return res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const {id} = req.params;
        const role = await Role.findByPk(id);

        if (!role) {
            return res.status(404).json({message: "Role not found"});
        }

        return res.status(200).json(role);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const {id} = req.params;
        const {name, permissions} = req.body;

        const role = await Role.findByPk(id);
        if (!role) {
            return res.status(404).json({message: "Role not found"});
        }

        await role.update({
            name: name || role.name,
            permissions: permissions || role.permissions,
        });

        return res.status(200).json({message: "Role updated successfully", role});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
};

// DESTROY
const destroy = async (req, res) => {
    try {
        const {id} = req.params;

        const role = await Role.findByPk(id);
        if (!role) {
            return res.status(404).json({message: "Role not found"});
        }

        await role.destroy();
        return res.status(200).json({message: "Role deleted successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
};

module.exports = {create, getAll, getOne, update, destroy};
