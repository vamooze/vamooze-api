"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const errors_1 = require("@feathersjs/errors");
const checkPermission = (options) => {
    return async (context) => {
        const { app, params } = context;
        if (params.user) {
            const userRole = await app.service('roles').get(params.user.role);
            if (!options.includes(userRole.name)) {
                throw new errors_1.Forbidden('You dont have the permission to access this route');
            }
        }
        return context;
    };
};
exports.checkPermission = checkPermission;
//# sourceMappingURL=checkPermission.js.map