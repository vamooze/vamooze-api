"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = void 0;
const roles_1 = require("./roles/roles");
const users_1 = require("./users/users");
const services = (app) => {
    app.configure(roles_1.roles);
    app.configure(users_1.user);
    app.post('/auth/logout', async (req, res) => {
        try {
            const USERS = app.service('users');
            const user = await USERS.find({ query: { email: req.body.email } });
            console.log('====================================');
            console.log(user.data[0]);
            console.log('====================================');
            const updatedUser = await USERS.patch(user.data[0].id, { is_logged_in: false });
            app.service('users').emit('loggingOut', { updatedUser });
            return res.json({ status: 200, message: 'User logged out successfully' });
        }
        catch (error) {
            res.json(error);
        }
    });
    // All services will be registered here
};
exports.services = services;
//# sourceMappingURL=index.js.map