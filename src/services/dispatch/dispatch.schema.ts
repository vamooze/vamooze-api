// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema";
import { Type, getValidator, querySyntax } from "@feathersjs/typebox";
import type { Static } from "@feathersjs/typebox";
import roles from "../../helpers/roles";
import type { HookContext } from "../../declarations";
import { dataValidator, queryValidator } from "../../validators";
import type { DispatchService } from "./dispatch.class";
import { superAdmin } from "../../helpers/permissions";

export enum TimeFrame {
  ALL_DAY = "All day",
  MORNING = "6am - 9am",
  LATE_MORNING = "9am - 12pm",
  EARLY_AFTERNOON = "12pm - 3pm",
  LATE_AFTERNOON = "3pm - 6pm",
  EVENING = "6pm - 9pm",
  NIGHT = "9pm - 12am",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum Days {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

// Main data model schema
export const dispatchSchema = Type.Object(
  {
    id: Type.Number(),
    user_id: Type.Number(),
    address: Type.String(),
    city: Type.String(),
    state: Type.String(),
    lga: Type.String(),
    country: Type.String(),
    available_days: Type.Array(Type.Enum(Days)),
    available_time_frames: Type.Array(Type.Enum(TimeFrame)),
    preferred_delivery_locations: Type.Array(
      Type.Object({
        address: Type.String(),
        latitude: Type.Number(),
        longitude: Type.Number(),
      })
    ),
    drivers_license: Type.String({ format: "uri" }),
    approval_status: Type.Enum(ApprovalStatus),
    approved_by: Type.Optional(Type.Number()), // ID of the admin who approved/rejected
    approval_date: Type.Optional(Type.String({ format: "date-time" })),
    created_at: Type.String({ format: "date-time" }),
    updated_at: Type.String({ format: "date-time" }),

    next_of_kin_name: Type.Optional(Type.String()),
    next_of_kin_phone_number: Type.Optional(Type.String()),
    next_of_kin_relationship: Type.Optional(Type.String()),
    bank_account_name: Type.String(),
    bank_account_number: Type.String(),
    onboarding_quiz_completed: Type.Boolean(),
    has_watched_onboarding_video: Type.Boolean(),
    suspended: Type.Optional(Type.Boolean()),
    suspended_at: Type.Optional(Type.String({ format: "date-time" })),
    suspended_by: Type.Optional(Type.Number()),
  },
  { $id: "Dispatch", additionalProperties: false }
);
export type Dispatch = Static<typeof dispatchSchema>;
export const dispatchValidator = getValidator(dispatchSchema, dataValidator);
export const dispatchResolver = resolve<Dispatch, HookContext<DispatchService>>(
  {}
);

export const dispatchExternalResolver = resolve<
  Dispatch,
  HookContext<DispatchService>
>({});

// Schema for creating new entries
export const dispatchDataSchema = Type.Pick(
  dispatchSchema,
  [
    "user_id",
    "address",
    "city",
    "state",
    "lga",
    "country",
    "available_days",
    "available_time_frames",
    "preferred_delivery_locations",
    "drivers_license",
    "approval_status",
    "next_of_kin_name",
    "next_of_kin_phone_number",
    "next_of_kin_relationship",
    "bank_account_name",
    "bank_account_number",
    "onboarding_quiz_completed",
    "has_watched_onboarding_video",
    "suspended",
    "suspended_at",
    "suspended_by"
  ],
  {
    $id: "DispatchData",
  }
);
export type DispatchData = Static<typeof dispatchDataSchema>;
export const dispatchDataValidator = getValidator(
  dispatchDataSchema,
  dataValidator
);
export const dispatchDataResolver = resolve<
  Dispatch,
  HookContext<DispatchService>
>({});

// Schema for updating existing entries
export const dispatchPatchSchema = Type.Partial(dispatchSchema, {
  $id: "DispatchPatch",
});
export type DispatchPatch = Static<typeof dispatchPatchSchema>;
export const dispatchPatchValidator = getValidator(
  dispatchPatchSchema,
  dataValidator
);
export const dispatchPatchResolver = resolve<
  Dispatch,
  HookContext<DispatchService>
>({});

// Schema for allowed query properties
export const dispatchQueryProperties = Type.Pick(dispatchSchema, [
  "id",
  "user_id",
  "address",
  "city",
  "state",
  "lga",
  "country",
  "available_days",
  "available_time_frames",
  "preferred_delivery_locations",
  "drivers_license",
  "approval_status",
  "next_of_kin_name",
  "next_of_kin_phone_number",
  "next_of_kin_relationship",
  "bank_account_name",
  "bank_account_number",
  "onboarding_quiz_completed",
  "has_watched_onboarding_video",
  "suspended",
  "suspended_at",
  "suspended_by"
]);
export const dispatchQuerySchema = Type.Intersect(
  [
    querySyntax(dispatchQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
);
export type DispatchQuery = Static<typeof dispatchQuerySchema>;
export const dispatchQueryValidator = getValidator(
  dispatchQuerySchema,
  queryValidator
);
export const dispatchQueryResolver = resolve<
  DispatchQuery,
  HookContext<DispatchService>
>({});
