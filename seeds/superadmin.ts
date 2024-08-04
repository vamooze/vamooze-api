import { Knex } from "knex";

exports.seed = async function (knex: Knex): Promise<void> {
  const superAdmin = { role: 4, email: "admin2@vamooze.com", password: 'vamooze123$' }

    await knex("users")
      .insert(superAdmin)
      .onConflict("id")
      .merge({ role: superAdmin.role, email: superAdmin.email, password: superAdmin.password });
  
};
