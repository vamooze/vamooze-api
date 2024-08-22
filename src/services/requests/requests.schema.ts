// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema";
import { Type, getValidator, querySyntax } from "@feathersjs/typebox";
import type { Static } from "@feathersjs/typebox";

import type { HookContext } from "../../declarations";
import { dataValidator, queryValidator } from "../../validators";
import type { RequestsService } from "./requests.class";
import {
  DeliveryMethod,
  PaymentMethod,
  RequestStatus,
  dispatchRequestValidators
} from "../../interfaces/constants";


// Main data model schema
export const requestsSchema = Type.Object(
  {
    id: Type.Number(),
    requester: Type.Number(),
    // receiver: Type.Object({
    //   name: Type.String({
    //     maxLength: dispatchRequestValidators.receiver_name_length,
    //   }),
    //   phone_number: Type.String({
    //     maxLength: dispatchRequestValidators.receiver_phone_number_length,
    //   }),
    //   email: Type.String(),
    // }),
    delivery_price_details: Type.Object({
      total_amount: Type.Number({ minimum: 1 }),
      base_fee: Type.Number({ minimum: 1 }),
      fee_per_km: Type.Number({ minimum: 1 }),
      fee_per_min: Type.Number({ minimum: 1 }),
    }),
    package_details: Type.Object({
      weight: Type.Optional(Type.Number({ minimum: 1 })),
      quantity: Type.Number({ minimum: 1 }),
      description: Type.Optional(
        Type.String({
          maxLength: dispatchRequestValidators.package_description_length,
        })
      ),
      image: Type.String(),
      estimated_worth: Type.Number({ minimum: 0 }),
    }),
    // priority: Type.Boolean({ default: false }),
    // payment_method: Type.Enum(PaymentMethod),
    // amount: Type.Number({ minimum: 1 }),
    // receiver_gps_location: Type.Optional(
    //   Type.Object({
    //     longitude: Type.Number({ minimum: -180 }),
    //     latitude: Type.Number({ minimum: -90 }),
    //   })
    // ),
    delivery_address: Type.String({
      maxLength: dispatchRequestValidators.delivery_address_length,
    }),
    pickup_address: Type.String({
      maxLength: dispatchRequestValidators.pickup_address_length,
    }),
    delivery_gps_location: Type.Optional(
      Type.Object({
        longitude: Type.Number({ minimum: -180 }),
        latitude: Type.Number({ minimum: -90 }),
      })
    ),
    pickup_gps_location: Type.Optional(
      Type.Object({
        longitude: Type.Number({ minimum: -180 }),
        latitude: Type.Number({ minimum: -90 }),
      })
    ),
    scheduled: Type.Optional(Type.Boolean({ default: false })),
    dispatch: Type.Integer({ minimum: 1 }),
    // business: Type.Integer({ minimum: 1 }),
    delivery_instructions: Type.Optional(
      Type.String({
        maxLength: dispatchRequestValidators.delivery_instructions_length,
      })
    ),
    estimated_distance: Type.Number({ minimum: 1 }),
    estimated_delivery_time: Type.Number({ minimum: 1 }),
    pickup_landmark: Type.Optional(
      Type.String({ maxLength: dispatchRequestValidators.landmark_length })
    ),
    delivery_landmark: Type.Optional(
      Type.String({ maxLength: dispatchRequestValidators.landmark_length })
    ),
    delivery_date: Type.Optional(Type.String({ format: "date-time" })),
    delivery_method: Type.Enum(DeliveryMethod, {
      default: DeliveryMethod.Bike,
    }),
    status: Type.Enum(RequestStatus, { default: RequestStatus.Pending }),
    // reference: Type.Optional(Type.String({ format: "uuid" })),
  },
  { $id: "Requests", additionalProperties: false }
);
export type Requests = Static<typeof requestsSchema>;
export const requestsValidator = getValidator(requestsSchema, dataValidator);
export const requestsResolver = resolve<Requests, HookContext<RequestsService>>(
  {}
);

export const requestsExternalResolver = resolve<
  Requests,
  HookContext<RequestsService>
>({});

// Schema for creating new entries
export const requestsDataSchema = Type.Pick(
  requestsSchema,
  [
    "requester",
    // "receiver",
    "package_details",
    // "payment_method",
    // "receiver_gps_location",
    "delivery_address",
    // "priority",
    "delivery_gps_location",
    "pickup_address",
    "pickup_gps_location",
    "scheduled",
    "dispatch",
    // "business",
    "delivery_instructions",
    // "pickup_landmark",
    // "delivery_landmark",
    // "delivery_date",
    "estimated_distance",
    "estimated_delivery_time",
    "status",
    // "reference",
    "delivery_method",
  ],
  {
    $id: "RequestsData",
  }
);
export type RequestsData = Static<typeof requestsDataSchema>;
export const requestsDataValidator = getValidator(
  requestsDataSchema,
  dataValidator
);
export const requestsDataResolver = resolve<
  Requests,
  HookContext<RequestsService>
>({});

// Schema for updating existing entries
export const requestsPatchSchema = Type.Partial(requestsSchema, {
  $id: "RequestsPatch",
});
export type RequestsPatch = Static<typeof requestsPatchSchema>;
export const requestsPatchValidator = getValidator(
  requestsPatchSchema,
  dataValidator
);
export const requestsPatchResolver = resolve<
  Requests,
  HookContext<RequestsService>
>({});

// Schema for allowed query properties
export const requestsQueryProperties = Type.Pick(requestsSchema, [
  "id",
  "requester",
  // "receiver",
  "package_details",
  // "payment_method",
  // "receiver_gps_location",
  "delivery_address",
  // "priority",
  "delivery_gps_location",
  "pickup_address",
  "pickup_gps_location",
  "scheduled",
  "dispatch",
  // "business",
  "delivery_instructions",
  // "pickup_landmark",
  // "delivery_landmark",
  // "delivery_date",
  "estimated_distance",
  "estimated_delivery_time",
  "status",
  // "reference",
  "delivery_method",
]);
export const requestsQuerySchema = Type.Intersect(
  [
    querySyntax(requestsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
);
export type RequestsQuery = Static<typeof requestsQuerySchema>;
export const requestsQueryValidator = getValidator(
  requestsQuerySchema,
  queryValidator
);
export const requestsQueryResolver = resolve<
  RequestsQuery,
  HookContext<RequestsService>
>({});
