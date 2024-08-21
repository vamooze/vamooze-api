// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'
import {DeliveryMethod, PaymentMethod, RequestStatus, dispatchRequestValidators} from "../src/interfaces/constants";

const tableName = 'requests'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.json('sender').notNullable()
    table.json('receiver').notNullable()
    table.json('package').notNullable()
    table.boolean('priority').notNullable().defaultTo(false)
    table.enum('payment_method', Object.values(PaymentMethod)).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.json('receiver_gps_location').nullable()
    table.string('delivery_address', dispatchRequestValidators.delivery_address_length).notNullable()
    table.string('pickup_address', dispatchRequestValidators.pickup_address_length).notNullable()
    table.json('delivery_gps_location').nullable()
    table.json('pickup_gps_location').nullable()
    table.boolean('scheduled').notNullable().defaultTo(false)
    table.integer('dispatch').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('business').unsigned().notNullable().references('id').inTable('business').onDelete('CASCADE');
    table.string('delivery_instructions', dispatchRequestValidators.delivery_instructions_length).nullable()
    table.decimal('estimated_distance', 10, 2).notNullable()
    table.decimal('estimated_delivery_time', 10, 2).notNullable()
    table.string('pickup_landmark', dispatchRequestValidators.landmark_length).nullable()
    table.string('delivery_landmark', dispatchRequestValidators.landmark_length).nullable()
    table.datetime('delivery_date').nullable()
    table.enum('delivery_method', Object.values(DeliveryMethod)).notNullable().defaultTo(DeliveryMethod.Bike)
    table.enum('status', Object.values(RequestStatus)).notNullable().defaultTo(RequestStatus.Pending)
    table.uuid('reference').unique().defaultTo(knex.fn.uuid());
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
