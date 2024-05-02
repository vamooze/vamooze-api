"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesClient = exports.rolesMethods = exports.rolesPath = void 0;
exports.rolesPath = 'roles';
exports.rolesMethods = ['find', 'get', 'create', 'patch', 'remove'];
const rolesClient = (client) => {
    const connection = client.get('connection');
    client.use(exports.rolesPath, connection.service(exports.rolesPath), {
        methods: exports.rolesMethods
    });
};
exports.rolesClient = rolesClient;
//# sourceMappingURL=roles.shared.js.map