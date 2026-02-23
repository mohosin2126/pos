const {Role, User} = require("../../database/models");
const {createRoleValidation, updateRoleValidation} = require("./validation");
const {PERMISSION_GROUPS, ALL_PERMISSIONS} = require("../../utils/permissions");
const {
    success,
    created: createdResponse,
    conflict,
    notFound,
    unprocessable,
    serverError,
} = require("../../utils/api-response");

const create = async (req, res) => {
    try {
        const {error, value} = createRoleValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            return unprocessable(res, "Validation failed.", error.details.map((d) => d.message));
        }

        const existing = await Role.findOne({where: {name: value.name}});
        if (existing) {
            return conflict(res, "Role name already exists.");
        }

        const role = await Role.create({
            name: value.name,
            permissions: value.permissions,
        });

        return createdResponse(res, "Role created successfully", role);
    } catch (err) {
        return serverError(res, "Failed to create role.", err);
    }
};

const getAll = async (req, res) => {
    try {
        const roles = await Role.findAll({
            order: [["id", "ASC"]],
            include: [{
                model: User,
                as: "users",
                attributes: ["id", "firstName", "lastName", "email"],
            }],
        });
        return success(res, "Roles fetched successfully", roles);
    } catch (err) {
        return serverError(res, "Failed to fetch roles.", err);
    }
};

const getOne = async (req, res) => {
    try {
        const {id} = req.params;
        const role = await Role.findByPk(id, {
            include: [{
                model: User,
                as: "users",
                attributes: ["id", "firstName", "lastName", "email"],
            }],
        });

        if (!role) {
            return notFound(res, "Role not found.");
        }

        return success(res, "Role fetched successfully", role);
    } catch (err) {
        return serverError(res, "Failed to fetch role.", err);
    }
};

const update = async (req, res) => {
    try {
        const {id} = req.params;
        const {error, value} = updateRoleValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            return unprocessable(res, "Validation failed.", error.details.map((d) => d.message));
        }

        const role = await Role.findByPk(id);
        if (!role) {
            return notFound(res, "Role not found.");
        }

       
        if (role.name === "admin" && value.name && value.name !== "admin") {
            return unprocessable(res, "Cannot rename the admin role.");
        }

        await role.update({
            name: value.name || role.name,
            permissions: value.permissions || role.permissions,
        });

        return success(res, "Role updated successfully", role);
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return conflict(res, "Role name already exists.");
        }
        return serverError(res, "Failed to update role.", err);
    }
};

const destroy = async (req, res) => {
    try {
        const {id} = req.params;

        const role = await Role.findByPk(id);
        if (!role) {
            return notFound(res, "Role not found.");
        }

      
        if (["admin", "manager", "employee"].includes(role.name)) {
            return unprocessable(res, `Cannot delete the built-in '${role.name}' role.`);
        }

        
        const userCount = await User.count({where: {roleId: id}});
        if (userCount > 0) {
            return conflict(res, `Cannot delete role. ${userCount} user(s) are assigned to it.`);
        }

        await role.destroy();
        return success(res, "Role deleted successfully");
    } catch (err) {
        return serverError(res, "Failed to delete role.", err);
    }
};

const getPermissions = async (_req, res) => {
    try {
        return success(res, "Permissions fetched successfully", {
            groups: PERMISSION_GROUPS,
            all: ALL_PERMISSIONS,
        });
    } catch (err) {
        return serverError(res, "Failed to fetch permissions.", err);
    }
};

module.exports = {create, getAll, getOne, update, destroy, getPermissions};
