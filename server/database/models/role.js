"use strict";
const {Model} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.hasMany(models.User, {
                foreignKey: "roleId",
                as: "users",
            });
        }
    }

    Role.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            permissions: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [
                    "view_dashboard",
                    "manage_users",
                    "assign_roles",
                    "view_reports",
                    "edit_profile"
                ]
            }
        },
        {
            sequelize,
            modelName: "Role",
            tableName: "roles"
        }
    );
    return Role;
};
