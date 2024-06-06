import { Knex } from "knex";

exports.seed = async function (knex: Knex): Promise<void> {
    const roles = [
        { id: 1, name: 'Admin', slug: 'admin', description: 'Administrator role with full permissions' },
        { id: 2, name: 'Asset-Owner', slug: 'asset-owner', description: 'Regular user role with limited permissions' },
        { id: 3, name: 'Dispatch', slug: 'dispatch', description: 'Dispatch role with permissions to accept orders' },
        { id: 4, name: 'Super-admin', slug: 'super-admin', description: 'Administrator role with full permissions' },
        { id: 5, name: 'Business-owner', slug: 'business-owner', description: 'Business owner role with full permission over a business' }
    ];

    for (const role of roles) {
        await knex('roles')
            .insert(role)
            .onConflict('id')
            .merge({ name: role.name, slug: role.slug, description: role.description });
    }
};
