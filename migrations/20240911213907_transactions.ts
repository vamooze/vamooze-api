// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from "knex";
import {
  TransactionStatus,
  TransactionType
} from "../src/interfaces/constants";

const tableName = 'transactions';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable( tableName, (table) => {
    table.increments('id');
    table.integer('wallet_id').unsigned().references('id').inTable('wallet');
    table.enum('type', Object.values(TransactionType)).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.enum('status', Object.values(TransactionStatus)).defaultTo('pending');
    table.string('reference').unique().notNullable();
    table.string('access_code').unique()
    table.jsonb('metadata');
    table.timestamps(true, true);
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(tableName)
}
