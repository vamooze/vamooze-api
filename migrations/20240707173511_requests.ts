import type { Knex } from "knex";
import {
  DeliveryMethod,
  PaymentMethod,
  RequestStatus,
  dispatchRequestValidators,
} from "../src/interfaces/constants";

const tableName = "requests";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments("id");
    table.integer("requester").notNullable();
    table.json("pickup_gps_location").nullable();
    table
      .string("pickup_address", dispatchRequestValidators.pickup_address_length)
      .notNullable();
    table
      .string(
        "delivery_address",
        dispatchRequestValidators.delivery_address_length
      )
      .notNullable();
    table.json("delivery_gps_location").nullable();
    table.boolean("scheduled").notNullable().defaultTo(false);
    table
      .string(
        "delivery_instructions",
        dispatchRequestValidators.delivery_instructions_length
      )
      .nullable();
    table
      .integer("delivery_method")
      .notNullable()
    table.decimal("estimated_distance", 10, 2).nullable();
    table.json("package_details").notNullable();
    table
      .enum("status", Object.values(RequestStatus))
      .notNullable()
      .defaultTo(RequestStatus.Pending);
    table
      .integer("dispatch")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("dispatch")
      .onDelete("CASCADE");
    table.json("delivery_price_details").notNullable();
    // Commented out as 'package' is not in the JSON
    // table.json('package').notNullable()

    // Commented out as 'priority' is not in the JSON
    // table.boolean('priority').notNullable().defaultTo(false)

    // Commented out as 'payment_method' is not in the JSON
    // table.enum('payment_method', Object.values(PaymentMethod)).notNullable();

    // Commented out as 'amount' is not in the JSON
    // table.decimal('amount', 10, 2).notNullable();

    // Commented out as 'receiver_gps_location' is not in the JSON
    // table.json('receiver_gps_location').nullable()

    // Commented out as 'business' is not in the JSON
    // table.integer('business').unsigned().notNullable().references('id').inTable('business').onDelete('CASCADE');

    // Commented out as 'estimated_distance' is not in the JSON
    // table.decimal('estimated_distance', 10, 2).nullable()

    // Commented out as 'pickup_landmark' is not in the JSON
    // table.string('pickup_landmark', dispatchRequestValidators.landmark_length).nullable()

    // Commented out as 'delivery_landmark' is not in the JSON
    // table.string('delivery_landmark', dispatchRequestValidators.landmark_length).nullable()

    // Commented out as 'delivery_date' is not in the JSON
    // table.datetime('delivery_date').nullable()

    // Commented out as 'status' is not in the JSON
    // table.enum('status', Object.values(RequestStatus)).notNullable().defaultTo(RequestStatus.Pending)

    // Commented out as 'reference' is not in the JSON
    // table.uuid('reference').unique().defaultTo(knex.fn.uuid());

    table.timestamps(false, true);
  });

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(tableName);
}
