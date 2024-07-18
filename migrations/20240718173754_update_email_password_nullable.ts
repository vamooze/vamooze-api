import type { Knex } from 'knex';

const tableName = 'users';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(tableName, (table) => {
        table.string('email').nullable().alter();
        table.string('password', 255).nullable().alter();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(tableName, (table) => {
        table.string('email').notNullable().alter();
        table.string('password', 255).notNullable().alter();
    });
}
