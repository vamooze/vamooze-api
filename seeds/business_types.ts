import { Knex } from "knex";

exports.seed = async function (knex: Knex): Promise<void> {
    const business_types = [
        { id: 1, name: 'Retail' },
        { id: 2, name: 'E-commerce' },
        { id: 3, name: 'Healthcare' },
        { id: 4, name: 'Education' },
        { id: 5, name: 'Finance' },
        { id: 6, name: 'Real Estate' },
        { id: 7, name: 'Entertainment' },
        { id: 8, name: 'Hospitality' },
        { id: 9, name: 'Technology' },
        { id: 10, name: 'Manufacturing' }
    ];

    for (const businessType of business_types) {
        await knex('business_types')
            .insert(businessType)
            .onConflict('id')
            .merge({ name: businessType.name });
    }
};
