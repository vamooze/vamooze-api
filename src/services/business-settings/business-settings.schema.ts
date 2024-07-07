// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { BusinessSettingsService } from './business-settings.class'

// Main data model schema
export const businessSettingsSchema = Type.Object(
  {
    id: Type.Number(),
    logo: Type.String(),
      cover_image: Type.Optional(Type.String()),
      primary_color: Type.String(),
      secondary_color: Type.String(),
      tertiary_color: Type.Optional(Type.String()),
      launcher_icon: Type.String(),
      business: Type.Number(),
  },
  { $id: 'BusinessSettings', additionalProperties: false }
)
export type BusinessSettings = Static<typeof businessSettingsSchema>
export const businessSettingsValidator = getValidator(businessSettingsSchema, dataValidator)
export const businessSettingsResolver = resolve<BusinessSettings, HookContext<BusinessSettingsService>>({})

export const businessSettingsExternalResolver = resolve<
  BusinessSettings,
  HookContext<BusinessSettingsService>
>({})

// Schema for creating new entries
export const businessSettingsDataSchema = Type.Pick(businessSettingsSchema, ['logo', 'cover_image', 'primary_color', 'secondary_color', 'tertiary_color', 'launcher_icon', 'business'], {
  $id: 'BusinessSettingsData'
})
export type BusinessSettingsData = Static<typeof businessSettingsDataSchema>
export const businessSettingsDataValidator = getValidator(businessSettingsDataSchema, dataValidator)
export const businessSettingsDataResolver = resolve<BusinessSettings, HookContext<BusinessSettingsService>>(
  {}
)

// Schema for updating existing entries
export const businessSettingsPatchSchema = Type.Partial(businessSettingsSchema, {
  $id: 'BusinessSettingsPatch'
})
export type BusinessSettingsPatch = Static<typeof businessSettingsPatchSchema>
export const businessSettingsPatchValidator = getValidator(businessSettingsPatchSchema, dataValidator)
export const businessSettingsPatchResolver = resolve<BusinessSettings, HookContext<BusinessSettingsService>>(
  {}
)

// Schema for allowed query properties
export const businessSettingsQueryProperties = Type.Pick(businessSettingsSchema, ['id', 'logo', 'cover_image', 'primary_color', 'secondary_color', 'tertiary_color', 'launcher_icon', 'business'])
export const businessSettingsQuerySchema = Type.Intersect(
  [
    querySyntax(businessSettingsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type BusinessSettingsQuery = Static<typeof businessSettingsQuerySchema>
export const businessSettingsQueryValidator = getValidator(businessSettingsQuerySchema, queryValidator)
export const businessSettingsQueryResolver = resolve<
  BusinessSettingsQuery,
  HookContext<BusinessSettingsService>
>({})
