import type { Knex } from 'knex';

const tableName = 'users';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.string('one_signal_alias', 1000).unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.dropColumn('one_signal_alias');
  });
}