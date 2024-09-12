// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'transactions';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable( tableName, (table) => {
    table.increments('id');
    table.integer('wallet_id').unsigned().references('id').inTable('wallets');
    table.enum('type', ['deposit', 'withdrawal']).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.enum('status', ['pending', 'completed', 'failed']).defaultTo('pending');
    table.string('reference').unique().notNullable();
    table.jsonb('metadata');
    table.timestamps(true, true);
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(tableName)
}
