import { Knex } from "knex";
import roles from '../src/helpers/roles'

exports.seed = async function (knex: Knex): Promise<void> {

    for (const role of roles) {
        await knex('roles')
            .insert(role)
            .onConflict('id')
            .merge({ name: role.name, slug: role.slug, description: role.description });
    }
};
