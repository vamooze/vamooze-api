import type { Knex } from 'knex';

const tableName = 'business';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.string('slug', 255).unique().notNullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.dropColumn('slug');
  });
}