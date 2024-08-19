import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.jsonb('quiz_responses').nullable().after('onboarding_quiz_completed');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.dropColumn('quiz_responses');
  });
}