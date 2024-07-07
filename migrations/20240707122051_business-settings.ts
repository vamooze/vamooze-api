// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'business_settings'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.string('logo', 150).notNullable()
    table.string('cover_image').nullable()
    table.string('primary_color').notNullable()
    table.string('secondary_color').notNullable()
    table.string('tertiary_color').nullable()
    table.string('launcher_icon').notNullable()
    table.integer('business').unsigned().notNullable().references('id').inTable('business').onDelete('CASCADE')
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
