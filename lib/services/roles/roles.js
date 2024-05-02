"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roles = void 0;
const schema_1 = require("@feathersjs/schema");
const roles_schema_1 = require("./roles.schema");
const roles_class_1 = require("./roles.class");
const roles_shared_1 = require("./roles.shared");
__exportStar(require("./roles.class"), exports);
__exportStar(require("./roles.schema"), exports);
// A configure function that registers the service and its hooks via `app.configure`
const roles = (app) => {
    // Register our service on the Feathers application
    app.use(roles_shared_1.rolesPath, new roles_class_1.RolesService((0, roles_class_1.getOptions)(app)), {
        // A list of all methods this service exposes externally
        methods: roles_shared_1.rolesMethods,
        // You can add additional custom events to be sent to clients here
        events: []
    });
    // Initialize hooks
    app.service(roles_shared_1.rolesPath).hooks({
        around: {
            all: [
                // authenticate('jwt'),
                schema_1.hooks.resolveExternal(roles_schema_1.rolesExternalResolver),
                schema_1.hooks.resolveResult(roles_schema_1.rolesResolver)
            ]
        },
        before: {
            all: [schema_1.hooks.validateQuery(roles_schema_1.rolesQueryValidator), schema_1.hooks.resolveQuery(roles_schema_1.rolesQueryResolver)],
            find: [],
            get: [],
            create: [schema_1.hooks.validateData(roles_schema_1.rolesDataValidator), schema_1.hooks.resolveData(roles_schema_1.rolesDataResolver)],
            patch: [schema_1.hooks.validateData(roles_schema_1.rolesPatchValidator), schema_1.hooks.resolveData(roles_schema_1.rolesPatchResolver)],
            remove: []
        },
        after: {
            all: []
        },
        error: {
            all: []
        }
    });
};
exports.roles = roles;
//# sourceMappingURL=roles.js.map