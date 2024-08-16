import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('business_settings', (table) => {
    table.string('logo', 1000).alter();
    table.string('cover_image', 1000).alter();
    table.string('launcher_icon', 1000).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('business_settings', (table) => {
    table.string('logo', 150).alter();
    table.string('cover_image', 255).alter();
    table.string('launcher_icon', 255).alter();
  });
}