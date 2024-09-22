export const superAdmin  = 'super-admin';

import {  Roles } from '../interfaces/constants'

const userRoles = {
  admin: [Roles.Admin],
  user: ["user"],
  superAdmin: [Roles.SuperAdmin],
  manager: [Roles.InHouseManager],
  all: ["user", Roles.Admin, Roles.SuperAdmin, Roles.InHouseManager, Roles.Dispatch, Roles.AssetOwner, Roles.BusinessOwner],
  allAdmin: [Roles.Admin, Roles.SuperAdmin],
  dispatch: [ Roles.Dispatch],
  allButUser: [Roles.Admin, Roles.SuperAdmin, Roles.InHouseManager, Roles.Dispatch],
  allButDispatch: [Roles.Admin, Roles.SuperAdmin, Roles.InHouseManager, "user"],
  superAdminAndDispatch: [Roles.SuperAdmin,  Roles.Dispatch],
};

export default userRoles