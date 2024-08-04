import { Knex } from "knex";
import { hashPassword } from '@feathersjs/authentication-local';

exports.seed = async function (knex: Knex): Promise<void> {
  const superAdmin = {
    role: 4,
    email: "admin4@vamooze.com",
    password: "vamooze123$",
    first_name: "admin2",
    last_name: "vamooze",
  };

  // Hash the password
  const hashedPassword = await hashPassword(superAdmin.password);

  await knex("users")
    .insert({
      ...superAdmin,
      password: hashedPassword,
    })
    .onConflict("id")
    .merge({
      role: superAdmin.role,
      email: superAdmin.email,
      password: hashedPassword,
      first_name: superAdmin.first_name,
      last_name: superAdmin.last_name
    });
};