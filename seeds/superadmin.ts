import { Knex } from "knex";

exports.seed = async function (knex: Knex): Promise<void> {
  const superAdmin = {
    role: 4,
    email: "admin3@vamooze.com",
    password: "vamooze123$",
    first_name: "admin2",
    last_name: "vamooze",
  };

  await knex("users")
    .insert(superAdmin)
    .onConflict("id")
    .merge({
      role: superAdmin.role,
      email: superAdmin.email,
      password: superAdmin.password,
      first_name: superAdmin.first_name,
      last_name: superAdmin.last_name
    });
};
