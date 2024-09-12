// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { TransactionsService } from './transactions.class'

// Main data model schema
export const transactionsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Transactions', additionalProperties: false }
)
export type Transactions = Static<typeof transactionsSchema>
export const transactionsValidator = getValidator(transactionsSchema, dataValidator)
export const transactionsResolver = resolve<Transactions, HookContext<TransactionsService>>({})

export const transactionsExternalResolver = resolve<Transactions, HookContext<TransactionsService>>({})

// Schema for creating new entries
export const transactionsDataSchema = Type.Pick(transactionsSchema, ['text'], {
  $id: 'TransactionsData'
})
export type TransactionsData = Static<typeof transactionsDataSchema>
export const transactionsDataValidator = getValidator(transactionsDataSchema, dataValidator)
export const transactionsDataResolver = resolve<Transactions, HookContext<TransactionsService>>({})

// Schema for updating existing entries
export const transactionsPatchSchema = Type.Partial(transactionsSchema, {
  $id: 'TransactionsPatch'
})
export type TransactionsPatch = Static<typeof transactionsPatchSchema>
export const transactionsPatchValidator = getValidator(transactionsPatchSchema, dataValidator)
export const transactionsPatchResolver = resolve<Transactions, HookContext<TransactionsService>>({})

// Schema for allowed query properties
export const transactionsQueryProperties = Type.Pick(transactionsSchema, ['id', 'text'])
export const transactionsQuerySchema = Type.Intersect(
  [
    querySyntax(transactionsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type TransactionsQuery = Static<typeof transactionsQuerySchema>
export const transactionsQueryValidator = getValidator(transactionsQuerySchema, queryValidator)
export const transactionsQueryResolver = resolve<TransactionsQuery, HookContext<TransactionsService>>({})
