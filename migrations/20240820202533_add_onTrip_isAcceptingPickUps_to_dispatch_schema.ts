import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.boolean('isAcceptingPickUps').notNullable().defaultTo(false);
    table.boolean('onTrip').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('dispatch', (table) => {
    table.dropColumn('isAcceptingPickUps');
    table.dropColumn('onTrip');
  });
}
