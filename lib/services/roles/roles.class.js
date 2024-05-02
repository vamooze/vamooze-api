"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.RolesService = void 0;
const knex_1 = require("@feathersjs/knex");
// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
class RolesService extends knex_1.KnexService {
}
exports.RolesService = RolesService;
const getOptions = (app) => {
    return {
        paginate: app.get('paginate'),
        Model: app.get('postgresqlClient'),
        name: 'roles'
    };
};
exports.getOptions = getOptions;
//# sourceMappingURL=roles.class.js.map