// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'assets';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.string('name', 50).notNullable()
    table.string('description', 255).nullable()
    table.bigInteger('asset_type').references('id').inTable('asset-type').notNullable()
    table.string('brand', 150).notNullable()
    table.string('model', 150).notNullable()
    table.string('eco_friendly_status').nullable()
    table.string('plate_number').nullable()
    table.string('location', 50).notNullable()
     table.json('asset_image').notNullable()
    table.uuid('asset_id').unique().defaultTo(knex.fn.uuid());
    table.enum('status', ['active', 'inactive']).notNullable().defaultTo('inactive');
    table.date('next_maintenance').nullable();
    table.string('proof_of_ownership', 1024).notNullable();
    table.string('id_card', 1024).notNullable();
    table.string('insurance_document', 1024).notNullable();
    table.bigInteger('user').references('id').inTable('users').notNullable()
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
