import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.jsonb('quiz_responses').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.dropColumn('quiz_responses');
  });
}