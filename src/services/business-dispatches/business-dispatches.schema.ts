// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { BusinessDispatchesService } from './business-dispatches.class'

// Main data model schema
export const businessDispatchesSchema = Type.Object(
  {
      id: Type.Integer({ minimum: 1 }),
      dispatch: Type.Integer({ minimum: 1 }),
      business: Type.Integer({ minimum: 1 }),
      start_date: Type.String({ format: 'date' }),
      end_date: Type.Optional(Type.String({ format: 'date' })),
      is_permanent: Type.Boolean(),
      created_at: Type.Optional(Type.String({ format: 'date-time' })),
      updated_at: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'BusinessDispatches', additionalProperties: false }
)
export type BusinessDispatches = Static<typeof businessDispatchesSchema>
export const businessDispatchesValidator = getValidator(businessDispatchesSchema, dataValidator)
export const businessDispatchesResolver = resolve<BusinessDispatches, HookContext<BusinessDispatchesService>>(
  {}
)

export const businessDispatchesExternalResolver = resolve<
  BusinessDispatches,
  HookContext<BusinessDispatchesService>
>({})

// Schema for creating new entries
export const businessDispatchesDataSchema = Type.Pick(businessDispatchesSchema, ['dispatch', 'business', 'start_date', 'end_date', 'is_permanent'], {
  $id: 'BusinessDispatchesData'
})
export type BusinessDispatchesData = Static<typeof businessDispatchesDataSchema>
export const businessDispatchesDataValidator = getValidator(businessDispatchesDataSchema, dataValidator)
export const businessDispatchesDataResolver = resolve<
  BusinessDispatches,
  HookContext<BusinessDispatchesService>
>({})

// Schema for updating existing entries
export const businessDispatchesPatchSchema = Type.Partial(businessDispatchesSchema, {
  $id: 'BusinessDispatchesPatch'
})
export type BusinessDispatchesPatch = Static<typeof businessDispatchesPatchSchema>
export const businessDispatchesPatchValidator = getValidator(businessDispatchesPatchSchema, dataValidator)
export const businessDispatchesPatchResolver = resolve<
  BusinessDispatches,
  HookContext<BusinessDispatchesService>
>({})

// Schema for allowed query properties
export const businessDispatchesQueryProperties = Type.Pick(businessDispatchesSchema, ['id', 'dispatch', 'business', 'start_date', 'end_date', 'is_permanent', 'created_at', 'updated_at'])
export const businessDispatchesQuerySchema = Type.Intersect(
  [
    querySyntax(businessDispatchesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type BusinessDispatchesQuery = Static<typeof businessDispatchesQuerySchema>
export const businessDispatchesQueryValidator = getValidator(businessDispatchesQuerySchema, queryValidator)
export const businessDispatchesQueryResolver = resolve<
  BusinessDispatchesQuery,
  HookContext<BusinessDispatchesService>
>({})
