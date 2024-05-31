// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'users';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.string('first_name', 100).notNullable()
    table.string('last_name', 100).notNullable()
    table.string('phone_number', 15).nullable()
    table.string('email').unique().notNullable()
    table.string('password', 255).notNullable()
    table.string('pin', 6).nullable()
    table.bigInteger('role').references('id').inTable('roles')
    table.uuid('merchant_id').unique().defaultTo(knex.fn.uuid());
    table.boolean('is_logged_in').notNullable().defaultTo(false);
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.text('address').nullable();
    table.string('state', 50).nullable();
    table.string('local_government_area', 50).nullable();
    table.integer('otp').nullable();
    table.string('one_signal_player_id', 150).nullable();
    table.timestamps(false, true);

    return table;
  })

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
