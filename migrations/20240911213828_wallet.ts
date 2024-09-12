// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'


const tableName = 'wallet';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.decimal('balance', 12, 2).defaultTo(0.00);
    table.timestamps(true, true);
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
