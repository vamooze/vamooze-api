"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesQueryResolver = exports.rolesQueryValidator = exports.rolesQuerySchema = exports.rolesQueryProperties = exports.rolesPatchResolver = exports.rolesPatchValidator = exports.rolesPatchSchema = exports.rolesDataResolver = exports.rolesDataValidator = exports.rolesDataSchema = exports.rolesExternalResolver = exports.rolesResolver = exports.rolesValidator = exports.rolesSchema = void 0;
// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
const schema_1 = require("@feathersjs/schema");
const typebox_1 = require("@feathersjs/typebox");
const validators_1 = require("../../validators");
// Main data model schema
exports.rolesSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    name: typebox_1.Type.String(),
    description: typebox_1.Type.Optional(typebox_1.Type.String()),
    slug: typebox_1.Type.String()
}, { $id: 'Roles', additionalProperties: false });
exports.rolesValidator = (0, typebox_1.getValidator)(exports.rolesSchema, validators_1.dataValidator);
exports.rolesResolver = (0, schema_1.resolve)({});
exports.rolesExternalResolver = (0, schema_1.resolve)({});
// Schema for creating new entries
exports.rolesDataSchema = typebox_1.Type.Pick(exports.rolesSchema, ['name', 'description', 'slug'], {
    $id: 'RolesData'
});
exports.rolesDataValidator = (0, typebox_1.getValidator)(exports.rolesDataSchema, validators_1.dataValidator);
exports.rolesDataResolver = (0, schema_1.resolve)({});
// Schema for updating existing entries
exports.rolesPatchSchema = typebox_1.Type.Partial(exports.rolesSchema, {
    $id: 'RolesPatch'
});
exports.rolesPatchValidator = (0, typebox_1.getValidator)(exports.rolesPatchSchema, validators_1.dataValidator);
exports.rolesPatchResolver = (0, schema_1.resolve)({});
// Schema for allowed query properties
exports.rolesQueryProperties = typebox_1.Type.Pick(exports.rolesSchema, ['id', 'name', 'description', 'slug']);
exports.rolesQuerySchema = typebox_1.Type.Intersect([
    (0, typebox_1.querySyntax)(exports.rolesQueryProperties),
    // Add additional query properties here
    typebox_1.Type.Object({}, { additionalProperties: false })
], { additionalProperties: false });
exports.rolesQueryValidator = (0, typebox_1.getValidator)(exports.rolesQuerySchema, validators_1.queryValidator);
exports.rolesQueryResolver = (0, schema_1.resolve)({});
//# sourceMappingURL=roles.schema.js.map