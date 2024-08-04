import { Knex } from "knex";

exports.seed = async function (knex: Knex): Promise<void> {
  const superAdmin = { role: 4, email: "admin@vamooze.com" }

    await knex("users")
      .insert(superAdmin)
      .onConflict("id")
      .merge({ role: superAdmin.role, email: superAdmin.email });
  
};
