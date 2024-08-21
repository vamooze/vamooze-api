import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.dropColumn('onboarding_quiz_completed');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.boolean('onboarding_quiz_completed').notNullable();
  });
}