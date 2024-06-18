// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'lease_preferences';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.integer('asset').unsigned().notNullable().references('id').inTable('assets').onDelete('CASCADE');
    table.integer('asset_owner').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('duration').notNullable();
    table.string('type').notNullable();
    table.decimal('rate', 10, 2).notNullable();
    table.string('payment_method').nullable();
    table.timestamps(false, true);

    table.unique(['asset', 'asset_owner']);
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
