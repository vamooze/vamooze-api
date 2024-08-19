import { Knex } from 'knex';
import slugify from 'slugify';

export async function up(knex: Knex): Promise<void> {
  // Step 1: Add the slug column as nullable
  await knex.schema.table('business', (table) => {
    table.string('slug', 255).nullable();
  });

  // Step 2: Populate the slug column for existing records
  const businesses = await knex('business').select('id', 'name');
  for (const business of businesses) {
    const slug = slugify(business.name, { lower: true, strict: true });
    await knex('business')
      .where({ id: business.id })
      .update({ slug });
  }

  // Step 3: Alter the slug column to be non-nullable
  await knex.schema.table('business', (table) => {
    table.string('slug', 255).notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop the slug column
  await knex.schema.table('business', (table) => {
    table.dropColumn('slug');
  });
}
