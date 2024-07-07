// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { BusinessTypesService } from './business-types.class'

// Main data model schema
export const businessTypesSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String(),
      description: Type.Optional(Type.String())
  },
  { $id: 'BusinessTypes', additionalProperties: false }
)
export type BusinessTypes = Static<typeof businessTypesSchema>
export const businessTypesValidator = getValidator(businessTypesSchema, dataValidator)
export const businessTypesResolver = resolve<BusinessTypes, HookContext<BusinessTypesService>>({})

export const businessTypesExternalResolver = resolve<BusinessTypes, HookContext<BusinessTypesService>>({})

// Schema for creating new entries
export const businessTypesDataSchema = Type.Pick(businessTypesSchema, ['name', 'description'], {
  $id: 'BusinessTypesData'
})
export type BusinessTypesData = Static<typeof businessTypesDataSchema>
export const businessTypesDataValidator = getValidator(businessTypesDataSchema, dataValidator)
export const businessTypesDataResolver = resolve<BusinessTypes, HookContext<BusinessTypesService>>({})

// Schema for updating existing entries
export const businessTypesPatchSchema = Type.Partial(businessTypesSchema, {
  $id: 'BusinessTypesPatch'
})
export type BusinessTypesPatch = Static<typeof businessTypesPatchSchema>
export const businessTypesPatchValidator = getValidator(businessTypesPatchSchema, dataValidator)
export const businessTypesPatchResolver = resolve<BusinessTypes, HookContext<BusinessTypesService>>({})

// Schema for allowed query properties
export const businessTypesQueryProperties = Type.Pick(businessTypesSchema, ['id', 'name', 'description'])
export const businessTypesQuerySchema = Type.Intersect(
  [
    querySyntax(businessTypesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type BusinessTypesQuery = Static<typeof businessTypesQuerySchema>
export const businessTypesQueryValidator = getValidator(businessTypesQuerySchema, queryValidator)
export const businessTypesQueryResolver = resolve<BusinessTypesQuery, HookContext<BusinessTypesService>>({})
