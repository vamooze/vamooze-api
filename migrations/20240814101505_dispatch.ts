import { Knex } from 'knex';
import { DispatchApprovalStatus } from '../src/interfaces/constants'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('dispatch', (table) => {
    table.increments('id');
    table.integer('user_id').notNullable().unique();
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('lga').notNullable();
    table.string('country').notNullable();
    table.specificType('available_days', 'text[]').notNullable();
    table.specificType('available_time_frames', 'text[]').notNullable();
    table.jsonb('preferred_delivery_locations').notNullable();
    table.string('drivers_license').notNullable();
    table.enum('approval_status', [DispatchApprovalStatus.Pending, DispatchApprovalStatus.Approved, DispatchApprovalStatus.Rejected])
    .notNullable()
    .defaultTo(DispatchApprovalStatus.Pending);
    table.integer('approved_by').nullable();
    table.timestamp('approval_date').nullable();

    table.string('next_of_kin_name').nullable();
    table.string('next_of_kin_relationship').nullable();
    table.string('next_of_kin_phone_number').nullable();
    table.string('bank_account_name').nullable();
    table.string('bank_account_number').nullable();
    table.string('mobile_money_number').nullable();

    table.boolean('onboarding_quiz_completed').notNullable();
    table.boolean('suspended').notNullable().defaultTo(false);;
    table.timestamp('suspended_at').nullable();
    table.integer('suspended_by').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('dispatch');
}