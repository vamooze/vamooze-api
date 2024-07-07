// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

const tableName = 'business';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')
    table.string('name', 255).notNullable()
    table.string('trading_name', 150).nullable()
    table.text('address').notNullable()
    table.integer('business_type').unsigned().notNullable().references('id').inTable('business_types').onDelete('CASCADE');
    table.json('contact').notNullable()
    table.integer('employee_count').nullable()
    table.date('date_established').nullable()
    table.string('url').nullable()
    table.string('country').notNullable()
    table.string('state').notNullable()
    table.json('registration_details').nullable()
    table.boolean('active').notNullable().defaultTo(false)
    table.integer('owner').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.timestamps(false, true);
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
  await knex.schema.dropTable(tableName)
}
