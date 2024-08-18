import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.string('next_of_kin_phone_number', 15).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.dropColumn('next_of_kin_phone_number');
  });
}