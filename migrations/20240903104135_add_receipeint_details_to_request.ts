import type { Knex } from "knex";
import { dispatchRequestValidators } from "../src/interfaces/constants";

const tableName = "requests";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.string("recipient_name", dispatchRequestValidators.receiver_name_length).nullable();
    table.string("recipient_phone_number").nullable();
    table.jsonb('current_dispatch_location').nullable();
    table.string('drop_off_recipient_name', 1000).nullable();
    table.string('drop_off_recipient_phone_number', 25).nullable();
    table.string('pickup_recipient_name', 1000).nullable();
    table.string('pickup_recipient_phone_number', 25).nullable();
    table.jsonb('initial_dispatch_location').nullable();
    table.timestamp('dispatch_pickup_time').nullable();
    table.timestamp('dispatch_drop_off_time').nullable();
    table.timestamp('dispatch_to_drop_off_time').nullable();
    table.timestamp('dispatch_accept_time').nullable();
    table.decimal('estimated_time_for_dispatch_delivery', 10, 2).nullable();
    table.decimal('estimated_time_for_dispatch_pickup', 10, 2).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.dropColumn("recipient_name");
    table.dropColumn("recipient_phone_number");
    table.jsonb('current_dispatch_location');
    table.dropColumn('drop_off_recipient_name');
    table.dropColumn('drop_off_recipient_phone_number');
    table.dropColumn('pickup_recipient_name');
    table.dropColumn('pickup_recipient_phone_number');
    table.dropColumn('initial_dispatch_location');
    table.dropColumn('dispatch_pickup_time');
    table.dropColumn('dispatch_drop_off_time');
    table.timestamp('dispatch_to_drop_off_time')
    table.timestamp('dispatch_accept_time').nullable();
    table.dropColumn('estimated_time_for_dispatch_delivery');
    table.dropColumn('estimated_time_for_dispatch_pickup');
  });
}