// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { UserService } from './users.class'

// Main data model schema
export const userSchema = Type.Object(
  {
    id: Type.Number(),
    first_name: Type.String(),
    last_name: Type.String(),
      phone_number: Type.Optional(Type.String()),
    pin: Type.Optional(Type.String()),
    role: Type.Optional(Type.Number()),
    merchant_id: Type.Optional(Type.String({ format: 'uuid' })),
    email: Type.Optional(Type.String({ format: 'email' })),
    password: Type.Optional(Type.String()),
      is_logged_in: Type.Optional(Type.Boolean()),
      is_verified: Type.Optional(Type.Boolean()),
      address: Type.Optional(Type.String()),
      local_government_area: Type.Optional(Type.String()),
      state: Type.Optional(Type.String()),
      one_signal_player_id: Type.Optional(Type.String()),
      one_signal_alias: Type.Optional(Type.String()),
      otp: Type.Optional(Type.Number())
     
  },
  { $id: 'User', additionalProperties: false }
)
export type User = Static<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext<UserService>>({})

export const userExternalResolver = resolve<User, HookContext<UserService>>({
  // The password should never be visible externally
  password: async () => undefined
})

// Schema for creating new entries
export const userDataSchema = Type.Pick(userSchema, ['email', 'password', 'first_name', 'last_name', 'pin', 'phone_number', 'role', 'merchant_id', 'state', 'local_government_area', 'address', 'is_logged_in', 'is_verified', 'one_signal_player_id', 'one_signal_alias' , 'otp'], {
  $id: 'UserData'
})
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' })
})

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' })
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'email', 'role', 'merchant_id', 'first_name', 'last_name', 'is_logged_in', 'is_verified', 'otp', 'phone_number'])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext<UserService>>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user.id
    }

    return value
  }
})