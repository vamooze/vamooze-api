// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'messages';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.bigInteger('sender').references('id').inTable('users').notNullable();
    table.bigInteger('receiver').references('id').inTable('users').notNullable();
    table.string('subject', 150).nullable();
    table.text('body').nullable();
    table.enum('status', ['read', 'unread']).notNullable().defaultTo('unread');
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
  await knex.schema.dropTable('messages')
}
