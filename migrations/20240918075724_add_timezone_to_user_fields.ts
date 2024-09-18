// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'users';
export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(tableName, (table) => {
    table.boolean('is_inhouse_invitee_default_password').nullable()
    table.bigInteger('in_house_inviter').references('id').inTable(tableName)
    table.string('timezone').nullable()
  }) 
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(tableName, (table) => {
        table.boolean('is_inhouse_invitee_default_password').nullable()
        table.bigInteger('in_house_inviter').references('id').inTable(tableName)
        table.string('timezone').nullable()
    });

}
