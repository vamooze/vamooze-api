// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { BusinessService } from './business.class'

// Main data model schema
export const businessSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String(),
      trading_name: Type.Optional(Type.String()),
      address: Type.String(),
      business_type: Type.Number(),
      contact: Type.Any(),
      employee_count: Type.Optional(Type.Number()),
      date_established: Type.Optional(Type.String({ format: 'date' })),
      url: Type.Optional(Type.String()),
      country: Type.String(),
      state: Type.String(),
      registration_details: Type.Optional(Type.Any()),
      active: Type.Optional(Type.Boolean()),
      owner: Type.Number()
  },
  { $id: 'Business', additionalProperties: false }
)
export type Business = Static<typeof businessSchema>
export const businessValidator = getValidator(businessSchema, dataValidator)
export const businessResolver = resolve<Business, HookContext<BusinessService>>({})

export const businessExternalResolver = resolve<Business, HookContext<BusinessService>>({})

// Schema for creating new entries
export const businessDataSchema = Type.Pick(businessSchema, ['name', 'trading_name', 'address', 'business_type', 'contact', 'employee_count', 'date_established', 'url', 'country', 'state', 'registration_details', 'active', 'owner'], {
  $id: 'BusinessData'
})
export type BusinessData = Static<typeof businessDataSchema>
export const businessDataValidator = getValidator(businessDataSchema, dataValidator)
export const businessDataResolver = resolve<Business, HookContext<BusinessService>>({})

// Schema for updating existing entries
export const businessPatchSchema = Type.Partial(businessSchema, {
  $id: 'BusinessPatch'
})
export type BusinessPatch = Static<typeof businessPatchSchema>
export const businessPatchValidator = getValidator(businessPatchSchema, dataValidator)
export const businessPatchResolver = resolve<Business, HookContext<BusinessService>>({})

// Schema for allowed query properties
export const businessQueryProperties = Type.Pick(businessSchema, ['id', 'name', 'trading_name', 'address', 'business_type', 'contact', 'employee_count', 'date_established', 'url', 'country', 'state', 'registration_details', 'active', 'owner'])
export const businessQuerySchema = Type.Intersect(
  [
    querySyntax(businessQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type BusinessQuery = Static<typeof businessQuerySchema>
export const businessQueryValidator = getValidator(businessQuerySchema, queryValidator)
export const businessQueryResolver = resolve<BusinessQuery, HookContext<BusinessService>>({})
