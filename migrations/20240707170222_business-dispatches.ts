// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'business_dispatches'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id').primary();
    table.integer('dispatch').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('business').unsigned().notNullable().references('id').inTable('business').onDelete('CASCADE');
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.boolean('is_permanent').defaultTo(false);
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
  await knex.schema.dropTable(tableName)
}
