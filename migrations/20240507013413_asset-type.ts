// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'asset-type';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.string('name', 50)
    table.string('description', 100)
    table.timestamps(false, true);
  })

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON "asset-type"
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(tableName)
}
