// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { RequestsService } from './requests.class'
import {DeliveryMethod, PaymentMethod, RequestStatus} from "../../interfaces/constants";

// Main data model schema
export const requestsSchema = Type.Object(
  {
    id: Type.Number(),
      sender: Type.Object({
          name: Type.String({ maxLength: 255 }),
          phone_number: Type.String({ maxLength: 12 }),
          email: Type.String({ maxLength: 70 })
      }),
      receiver: Type.Object({
          name: Type.String({ maxLength: 255 }),
          phone_number: Type.String({ maxLength: 12 }),
          email: Type.String({ maxLength: 70 })
      }),
      package: Type.Object({
          weight: Type.Optional(Type.Number({ minimum: 1 })),
          quantity: Type.Number({ minimum: 1 }),
          description: Type.Optional(Type.String({ maxLength: 255 })),
          image: Type.Optional(Type.String({ maxLength: 255 })),
          estimated_worth: Type.Number({ minimum: 0 }),
      }),
      priority: Type.Boolean({ default: false }),
      payment_method: Type.Enum(PaymentMethod),
      amount: Type.Number({ minimum: 1 }),
      receiver_gps_location: Type.Optional(Type.Object({
          longitude: Type.Number({ minimum: -180 }),
          latitude: Type.Number({ minimum: -90 })
      })),
      delivery_address: Type.String({ maxLength: 255 }),
      pickup_address: Type.String({ maxLength: 255 }),
      delivery_gps_location: Type.Optional(Type.Object({
          longitude: Type.Number({ minimum: -180 }),
          latitude: Type.Number({ minimum: -90 })

      })),
      pickup_gps_location: Type.Optional(Type.Object({
          longitude: Type.Number({ minimum: -180 }),
          latitude: Type.Number({ minimum: -90 })
      })),
      scheduled: Type.Boolean({ default: false }),
      dispatch: Type.Integer({ minimum: 1 }),
      business: Type.Integer({ minimum: 1 }),
      delivery_instructions: Type.Optional(Type.String({ maxLength: 255 })),
      estimated_distance: Type.Number({ minimum: 1 }),
      estimated_delivery_time: Type.Number({ minimum: 1 }),
      pickup_landmark: Type.Optional(Type.String({ maxLength: 255 })),
      delivery_landmark: Type.Optional(Type.String({ maxLength: 255 })),
      delivery_date: Type.Optional(Type.String({ format: 'date-time' })),
      delivery_method: Type.Enum(DeliveryMethod, { default: DeliveryMethod.Bike }),
      status: Type.Enum(RequestStatus, { default: RequestStatus.Pending }),
      reference: Type.Optional(Type.String({ format: 'uuid' }))
  },
  { $id: 'Requests', additionalProperties: false }
)
export type Requests = Static<typeof requestsSchema>
export const requestsValidator = getValidator(requestsSchema, dataValidator)
export const requestsResolver = resolve<Requests, HookContext<RequestsService>>({})

export const requestsExternalResolver = resolve<Requests, HookContext<RequestsService>>({})

// Schema for creating new entries
export const requestsDataSchema = Type.Pick(requestsSchema, [
    'sender',
    'receiver', 'package',
    'payment_method', 'amount',
    'receiver_gps_location', 'delivery_address',
    'priority', 'delivery_gps_location',
    'pickup_address', 'pickup_gps_location',
    'scheduled', 'dispatch', 'business', 'delivery_instructions',
    'pickup_landmark', 'delivery_landmark', 'delivery_date',
    'estimated_distance', 'estimated_delivery_time', 'status', 'reference', 'delivery_method'
], {
  $id: 'RequestsData'
})
export type RequestsData = Static<typeof requestsDataSchema>
export const requestsDataValidator = getValidator(requestsDataSchema, dataValidator)
export const requestsDataResolver = resolve<Requests, HookContext<RequestsService>>({})

// Schema for updating existing entries
export const requestsPatchSchema = Type.Partial(requestsSchema, {
  $id: 'RequestsPatch'
})
export type RequestsPatch = Static<typeof requestsPatchSchema>
export const requestsPatchValidator = getValidator(requestsPatchSchema, dataValidator)
export const requestsPatchResolver = resolve<Requests, HookContext<RequestsService>>({})

// Schema for allowed query properties
export const requestsQueryProperties = Type.Pick(requestsSchema, [
    'id','sender',
    'receiver', 'package',
    'payment_method', 'amount',
    'receiver_gps_location', 'delivery_address',
    'priority', 'delivery_gps_location',
    'pickup_address', 'pickup_gps_location',
    'scheduled', 'dispatch', 'business', 'delivery_instructions',
    'pickup_landmark', 'delivery_landmark', 'delivery_date',
    'estimated_distance', 'estimated_delivery_time', 'status', 'reference', 'delivery_method'
])
export const requestsQuerySchema = Type.Intersect(
  [
    querySyntax(requestsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type RequestsQuery = Static<typeof requestsQuerySchema>
export const requestsQueryValidator = getValidator(requestsQuerySchema, queryValidator)
export const requestsQueryResolver = resolve<RequestsQuery, HookContext<RequestsService>>({})