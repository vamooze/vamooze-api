const userRoles = {
  admin: ["admin"],
  user: ["user"],
  superAdmin: ["superAdmin"],
  manager: ["manager"],
  all: ["user", "admin", "superAdmin", "manager", "dispatch"],
  allAdmin: ["admin", "superAdmin"],
  dispatch: ["dispatch"],
  allButUser: ["admin", "superAdmin", "manager", "dispatch"],
  allButDispatch: ["admin", "superAdmin", "manager", "user"],
};

export default userRoles