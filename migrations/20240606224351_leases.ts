// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'leases';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.enum('status', ['ongoing', 'expired']).notNullable().defaultTo('ongoing');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('asset_id').unsigned().notNullable().references('id').inTable('assets').onDelete('CASCADE');
    table.integer('duration').notNullable();
    table.decimal('rate').notNullable();
    table.uuid('reference').unique().defaultTo(knex.fn.uuid());
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
  await knex.schema.dropTable('leases')
}
