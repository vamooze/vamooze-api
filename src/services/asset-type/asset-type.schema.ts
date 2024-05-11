// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AssetTypeService } from './asset-type.class'

// Main data model schema
export const assetTypeSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String(),
      description: Type.Optional(Type.String()),
  },
  { $id: 'AssetType', additionalProperties: false }
)
export type AssetType = Static<typeof assetTypeSchema>
export const assetTypeValidator = getValidator(assetTypeSchema, dataValidator)
export const assetTypeResolver = resolve<AssetType, HookContext<AssetTypeService>>({})

export const assetTypeExternalResolver = resolve<AssetType, HookContext<AssetTypeService>>({})

// Schema for creating new entries
export const assetTypeDataSchema = Type.Pick(assetTypeSchema, ['name', 'description'], {
  $id: 'AssetTypeData'
})
export type AssetTypeData = Static<typeof assetTypeDataSchema>
export const assetTypeDataValidator = getValidator(assetTypeDataSchema, dataValidator)
export const assetTypeDataResolver = resolve<AssetType, HookContext<AssetTypeService>>({})

// Schema for updating existing entries
export const assetTypePatchSchema = Type.Partial(assetTypeSchema, {
  $id: 'AssetTypePatch'
})
export type AssetTypePatch = Static<typeof assetTypePatchSchema>
export const assetTypePatchValidator = getValidator(assetTypePatchSchema, dataValidator)
export const assetTypePatchResolver = resolve<AssetType, HookContext<AssetTypeService>>({})

// Schema for allowed query properties
export const assetTypeQueryProperties = Type.Pick(assetTypeSchema, ['id', 'name', 'description'])
export const assetTypeQuerySchema = Type.Intersect(
  [
    querySyntax(assetTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AssetTypeQuery = Static<typeof assetTypeQuerySchema>
export const assetTypeQueryValidator = getValidator(assetTypeQuerySchema, queryValidator)
export const assetTypeQueryResolver = resolve<AssetTypeQuery, HookContext<AssetTypeService>>({})
