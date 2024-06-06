// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { LeasesService } from './leases.class'
import {LeaseStatus} from "../../interfaces/constants";

// Main data model schema
export const leasesSchema = Type.Object(
  {
    id: Type.Number(),
      status: Type.Optional(Type.Enum(LeaseStatus)),
      start_date: Type.String({ format: 'date' }),
      end_date: Type.String({ format: 'date' }),
      user_id: Type.Number(),
      asset_id: Type.Number(),
      duration: Type.Number(),
      rate: Type.Number(),
      reference: Type.Optional(Type.String())

  },
  { $id: 'Leases', additionalProperties: false }
)
export type Leases = Static<typeof leasesSchema>
export const leasesValidator = getValidator(leasesSchema, dataValidator)
export const leasesResolver = resolve<Leases, HookContext<LeasesService>>({})

export const leasesExternalResolver = resolve<Leases, HookContext<LeasesService>>({})

// Schema for creating new entries
export const leasesDataSchema = Type.Pick(leasesSchema, ['status','start_date','end_date','user_id','asset_id','duration','rate'], {
  $id: 'LeasesData'
})
export type LeasesData = Static<typeof leasesDataSchema>
export const leasesDataValidator = getValidator(leasesDataSchema, dataValidator)
export const leasesDataResolver = resolve<Leases, HookContext<LeasesService>>({})

// Schema for updating existing entries
export const leasesPatchSchema = Type.Partial(leasesSchema, {
  $id: 'LeasesPatch'
})
export type LeasesPatch = Static<typeof leasesPatchSchema>
export const leasesPatchValidator = getValidator(leasesPatchSchema, dataValidator)
export const leasesPatchResolver = resolve<Leases, HookContext<LeasesService>>({})

// Schema for allowed query properties
export const leasesQueryProperties = Type.Pick(leasesSchema, ['id', 'status','start_date','end_date','user_id','asset_id','duration','rate', 'reference'])
export const leasesQuerySchema = Type.Intersect(
  [
    querySyntax(leasesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type LeasesQuery = Static<typeof leasesQuerySchema>
export const leasesQueryValidator = getValidator(leasesQuerySchema, queryValidator)
export const leasesQueryResolver = resolve<LeasesQuery, HookContext<LeasesService>>({})
