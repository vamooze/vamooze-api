import type { Knex } from "knex";
import { dispatchRequestValidators } from "../src/interfaces/constants";

const tableName = "requests";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.string("recipient_name", dispatchRequestValidators.receiver_name_length).nullable();
    table.string("recipient_phone_number").nullable();
    table.jsonb('current_dispatch_location').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(tableName, (table) => {
    table.dropColumn("recipient_name");
    table.dropColumn("recipient_phone_number");
    table.jsonb('current_dispatch_location');
  });
}