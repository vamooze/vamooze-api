// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { RolesService } from './roles.class'

// Main data model schema
export const rolesSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    slug: Type.String()
  },
  { $id: 'Roles', additionalProperties: false }
)
export type Roles = Static<typeof rolesSchema>
export const rolesValidator = getValidator(rolesSchema, dataValidator)
export const rolesResolver = resolve<Roles, HookContext<RolesService>>({})

export const rolesExternalResolver = resolve<Roles, HookContext<RolesService>>({})

// Schema for creating new entries
export const rolesDataSchema = Type.Pick(rolesSchema, ['name', 'description', 'slug'], {
  $id: 'RolesData'
})
export type RolesData = Static<typeof rolesDataSchema>
export const rolesDataValidator = getValidator(rolesDataSchema, dataValidator)
export const rolesDataResolver = resolve<Roles, HookContext<RolesService>>({})

// Schema for updating existing entries
export const rolesPatchSchema = Type.Partial(rolesSchema, {
  $id: 'RolesPatch'
})
export type RolesPatch = Static<typeof rolesPatchSchema>
export const rolesPatchValidator = getValidator(rolesPatchSchema, dataValidator)
export const rolesPatchResolver = resolve<Roles, HookContext<RolesService>>({})

// Schema for allowed query properties
export const rolesQueryProperties = Type.Pick(rolesSchema, ['id', 'name', 'description', 'slug'])
export const rolesQuerySchema = Type.Intersect(
  [
    querySyntax(rolesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type RolesQuery = Static<typeof rolesQuerySchema>
export const rolesQueryValidator = getValidator(rolesQuerySchema, queryValidator)
export const rolesQueryResolver = resolve<RolesQuery, HookContext<RolesService>>({})
