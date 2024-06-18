// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'
import {MaintenanceStatus, MaintenanceType} from "../src/interfaces/constants";

const tableName = 'maintenance';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')

    table.integer('asset').unsigned().notNullable().references('id').inTable('assets').onDelete('CASCADE');
    table.enum('type', Object.values(MaintenanceType)).notNullable().defaultTo(MaintenanceType.Servicing);
    table.string('description', 255).nullable();
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.enum('status', Object.values((MaintenanceStatus))).notNullable().defaultTo(MaintenanceStatus.Pending);
    table.string('technician').notNullable();
    table.decimal('total_cost', 10, 2).notNullable();
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
