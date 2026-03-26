"use strict";

const { forbidden } = require("../utils/api-response");

function requirePermission(...requiredPermissions) {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return forbidden(res, "Access denied. No user context.");
            }

           
            if (user.role === "admin") {
                return next();
            }

         
            const userPermissions = user.permissions || [];

            
            const hasAll = requiredPermissions.every((perm) =>
                userPermissions.includes(perm)
            );

            if (!hasAll) {
                return forbidden(
                    res,
                    "You do not have permission to access this resource."
                );
            }

            next();
        } catch (err) {
            return forbidden(res, "Authorization check failed.");
        }
    };
}

module.exports = { requirePermission };
