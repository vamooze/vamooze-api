// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'users';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.string('first_name', 100).notNullable()
    table.string('last_name', 100).notNullable()
    table.string('phone_number', 15).nullable()
    table.string('email').unique().notNullable()
    table.string('password', 255).notNullable()
    table.string('pin', 6).nullable()
    table
      .integer('role')
      .nullable();
    table
      .foreign('role')
      .references('id')
      .inTable('roles')
    table.uuid('merchant_id').unique().defaultTo(knex.fn.uuid())
    table.timestamps(false, true);
  })

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
