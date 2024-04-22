import type { Knex } from 'knex'

exports.up = function(knex: Knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$;
  `);
};

exports.down = function(knex: Knex) {
  return knex.raw(`
    DROP FUNCTION IF EXISTS update_timestamp() CASCADE;
  `);
};
