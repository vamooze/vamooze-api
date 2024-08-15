export const superAdmin  = 'super-admin';

import {  Roles } from '../interfaces/constants'

const userRoles = {
  admin: ["admin"],
  user: ["user"],
  superAdmin: [Roles.SuperAdmin],
  manager: ["manager"],
  all: ["user", "admin", Roles.SuperAdmin, "manager", "dispatch"],
  allAdmin: ["admin", Roles.SuperAdmin],
  dispatch: ["dispatch"],
  allButUser: ["admin", Roles.SuperAdmin, "manager", "dispatch"],
  allButDispatch: ["admin", Roles.SuperAdmin, "manager", "user"],
  superAdminAndDispatch: [Roles.SuperAdmin, "dispatch"],
};

export default userRoles