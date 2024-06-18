// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { LeasePreferencesService } from './lease-preferences.class'

// Main data model schema
export const leasePreferencesSchema = Type.Object(
  {
    id: Type.Number(),
    asset: Type.Number(),
      asset_owner: Type.Number(),
      duration: Type.Number(),
      type: Type.String(),
      rate: Type.Number(),
      payment_method: Type.String(),
      created_at: Type.Optional(Type.String({ format: 'date-time' })),
      updated_at: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'LeasePreferences', additionalProperties: false }
)
export type LeasePreferences = Static<typeof leasePreferencesSchema>
export const leasePreferencesValidator = getValidator(leasePreferencesSchema, dataValidator)
export const leasePreferencesResolver = resolve<LeasePreferences, HookContext<LeasePreferencesService>>({})

export const leasePreferencesExternalResolver = resolve<
  LeasePreferences,
  HookContext<LeasePreferencesService>
>({})

// Schema for creating new entries
export const leasePreferencesDataSchema = Type.Pick(leasePreferencesSchema, ['asset','asset_owner','duration','type','rate','payment_method'], {
  $id: 'LeasePreferencesData'
})
export type LeasePreferencesData = Static<typeof leasePreferencesDataSchema>
export const leasePreferencesDataValidator = getValidator(leasePreferencesDataSchema, dataValidator)
export const leasePreferencesDataResolver = resolve<LeasePreferences, HookContext<LeasePreferencesService>>(
  {}
)

// Schema for updating existing entries
export const leasePreferencesPatchSchema = Type.Partial(leasePreferencesSchema, {
  $id: 'LeasePreferencesPatch'
})
export type LeasePreferencesPatch = Static<typeof leasePreferencesPatchSchema>
export const leasePreferencesPatchValidator = getValidator(leasePreferencesPatchSchema, dataValidator)
export const leasePreferencesPatchResolver = resolve<LeasePreferences, HookContext<LeasePreferencesService>>(
  {}
)

// Schema for allowed query properties
export const leasePreferencesQueryProperties = Type.Pick(leasePreferencesSchema, ['id', 'asset','asset_owner','duration','type','rate','payment_method'])
export const leasePreferencesQuerySchema = Type.Intersect(
  [
    querySyntax(leasePreferencesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type LeasePreferencesQuery = Static<typeof leasePreferencesQuerySchema>
export const leasePreferencesQueryValidator = getValidator(leasePreferencesQuerySchema, queryValidator)
export const leasePreferencesQueryResolver = resolve<
  LeasePreferencesQuery,
  HookContext<LeasePreferencesService>
>({})
