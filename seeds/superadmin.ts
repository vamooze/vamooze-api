import { Knex } from "knex";
import bcrypt from 'bcryptjs'

exports.seed = async function (knex: Knex): Promise<void> {
  const superAdmin = {
    role: 4,
    email: "admin4@vamooze.com",
    password: "vamooze123$",
    first_name: "admin2",
    last_name: "vamooze",
  };

  // Hash the password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(superAdmin.password, saltRounds);

  await knex("users")
    .insert({
      role: superAdmin.role,
      email: superAdmin.email,
      password: hashedPassword,
      first_name: superAdmin.first_name,
      last_name: superAdmin.last_name,
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