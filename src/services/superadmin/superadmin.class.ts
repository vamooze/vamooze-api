// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

type Superadmin = any
type SuperadminData = any
type SuperadminPatch = any
type SuperadminQuery = any

export type { Superadmin, SuperadminData, SuperadminPatch, SuperadminQuery }

export interface SuperadminServiceOptions {
  app: Application
}

export interface SuperadminParams extends Params<SuperadminQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class SuperadminService<ServiceParams extends SuperadminParams = SuperadminParams>
  implements ServiceInterface<Superadmin, SuperadminData, ServiceParams, SuperadminPatch>
{
  constructor(public options: SuperadminServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Superadmin[]> {
    return []
  }

  async get(id: Id, _params?: ServiceParams): Promise<Superadmin> {
    return {
      id: 0,
      text: `A new message with ID: ${id}!`
    }
  }

  async create(data: SuperadminData, params?: ServiceParams): Promise<Superadmin>
  async create(data: SuperadminData[], params?: ServiceParams): Promise<Superadmin[]>
  async create(
    data: SuperadminData | SuperadminData[],
    params?: ServiceParams
  ): Promise<Superadmin | Superadmin[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: SuperadminData, _params?: ServiceParams): Promise<Superadmin> {
    return {
      id: 0,
      ...data
    }
  }

  async patch(id: NullableId, data: SuperadminPatch, _params?: ServiceParams): Promise<Superadmin> {
    return {
      id: 0,
      text: `Fallback for ${id}`,
      ...data
    }
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Superadmin> {
    return {
      id: 0,
      text: 'removed'
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
