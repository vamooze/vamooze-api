// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AssetsService } from './assets.class'
import {AssetStatus} from "../../interfaces/constants";

// Main data model schema
export const assetsSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String(),
      description: Type.Optional(Type.String()),
      asset_type: Type.Number(),
      brand: Type.String(),
      model: Type.String(),
      eco_friendly_status: Type.Optional(Type.String()),
      location: Type.String(),
      asset_image: Type.Array(Type.String({format: 'uri'})),
      asset_id: Type.Optional(Type.String({ format: 'uuid' })),
      status: Type.Optional(Type.Enum(AssetStatus)),
      next_maintenance: Type.Optional(Type.String({ format: 'date' })),
      proof_of_ownership: Type.String({ format: 'uri' }),
      id_card: Type.String({ format: 'uri' }),
      insurance_document: Type.String({ format: 'uri' }),
      user: Type.Number()
  },
  { $id: 'Assets', additionalProperties: false }
)
export type Assets = Static<typeof assetsSchema>
export const assetsValidator = getValidator(assetsSchema, dataValidator)
export const assetsResolver = resolve<Assets, HookContext<AssetsService>>({})

export const assetsExternalResolver = resolve<Assets, HookContext<AssetsService>>({})

// Schema for creating new entries
export const assetsDataSchema = Type.Pick(assetsSchema, [
    'name',
    'description',
    'asset_type',
    'brand',
    'model',
    'eco_friendly_status',
    'location',
    'asset_image',
    'asset_id',
    'status',
    'next_maintenance',
    'proof_of_ownership',
    'id_card',
    'insurance_document',
    'user'
], {
  $id: 'AssetsData'
})
export type AssetsData = Static<typeof assetsDataSchema>
export const assetsDataValidator = getValidator(assetsDataSchema, dataValidator)
export const assetsDataResolver = resolve<Assets, HookContext<AssetsService>>({})

// Schema for updating existing entries
export const assetsPatchSchema = Type.Partial(assetsSchema, {
  $id: 'AssetsPatch'
})
export type AssetsPatch = Static<typeof assetsPatchSchema>
export const assetsPatchValidator = getValidator(assetsPatchSchema, dataValidator)
export const assetsPatchResolver = resolve<Assets, HookContext<AssetsService>>({})

// Schema for allowed query properties
export const assetsQueryProperties = Type.Pick(assetsSchema, [
    'name',
    'description',
    'asset_type',
    'brand',
    'model',
    'eco_friendly_status',
    'location',
    'asset_image',
    'asset_id',
    'status',
    'next_maintenance',
    'proof_of_ownership',
    'id_card',
    'insurance_document',
    'user'
])
export const assetsQuerySchema = Type.Intersect(
  [
    querySyntax(assetsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AssetsQuery = Static<typeof assetsQuerySchema>
export const assetsQueryValidator = getValidator(assetsQuerySchema, queryValidator)
export const assetsQueryResolver = resolve<AssetsQuery, HookContext<AssetsService>>({})
