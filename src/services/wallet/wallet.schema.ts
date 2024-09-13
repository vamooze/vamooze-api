// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { WalletService } from './wallet.class'

// Main data model schema
export const walletSchema = Type.Object(
  {
    id: Type.Number(),
    user_id: Type.Number(),
    balance: Type.Number({ minimum: 0, maximum: 9999999999.99 }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Wallet', additionalProperties: false }
)
export type Wallet = Static<typeof walletSchema>
export const walletValidator = getValidator(walletSchema, dataValidator)
export const walletResolver = resolve<Wallet, HookContext<WalletService>>({})

export const walletExternalResolver = resolve<Wallet, HookContext<WalletService>>({})

// Schema for creating new entries
export const walletDataSchema = Type.Pick(walletSchema, ['user_id', 'balance'], {
  $id: 'WalletData'
})
export type WalletData = Static<typeof walletDataSchema>
export const walletDataValidator = getValidator(walletDataSchema, dataValidator)
export const walletDataResolver = resolve<Wallet, HookContext<WalletService>>({})

// Schema for updating existing entries
export const walletPatchSchema = Type.Partial(walletSchema, {
  $id: 'WalletPatch'
})
export type WalletPatch = Static<typeof walletPatchSchema>
export const walletPatchValidator = getValidator(walletPatchSchema, dataValidator)
export const walletPatchResolver = resolve<Wallet, HookContext<WalletService>>({})

// Schema for allowed query properties
export const walletQueryProperties = Type.Pick(walletSchema, ['id', 'user_id', 'balance'])
export const walletQuerySchema = Type.Intersect(
  [
    querySyntax(walletQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type WalletQuery = Static<typeof walletQuerySchema>
export const walletQueryValidator = getValidator(walletQuerySchema, queryValidator)
export const walletQueryResolver = resolve<WalletQuery, HookContext<WalletService>>({})