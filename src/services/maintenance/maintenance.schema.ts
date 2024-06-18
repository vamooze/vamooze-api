// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MaintenanceService } from './maintenance.class'
import {MaintenanceStatus, MaintenanceType} from "../../interfaces/constants";

// Main data model schema
export const maintenanceSchema = Type.Object(
  {
    id: Type.Number(),
    asset: Type.Number(),
      type: Type.Optional(Type.Enum(MaintenanceType)),
      description: Type.Optional(Type.String()),
      start_date: Type.String({ format: 'date' }),
      end_date: Type.Optional(Type.String({ format: 'date-time' })),
      status: Type.Optional(Type.Enum(MaintenanceStatus)),
      technician: Type.String(),
      total_cost: Type.Number(),
      created_at: Type.Optional(Type.String({ format: 'date-time' })),
      updated_at: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'Maintenance', additionalProperties: false }
)
export type Maintenance = Static<typeof maintenanceSchema>
export const maintenanceValidator = getValidator(maintenanceSchema, dataValidator)
export const maintenanceResolver = resolve<Maintenance, HookContext<MaintenanceService>>({})

export const maintenanceExternalResolver = resolve<Maintenance, HookContext<MaintenanceService>>({})

// Schema for creating new entries
export const maintenanceDataSchema = Type.Pick(maintenanceSchema, ['asset','type','description','start_date','end_date','status','technician','total_cost'], {
  $id: 'MaintenanceData'
})
export type MaintenanceData = Static<typeof maintenanceDataSchema>
export const maintenanceDataValidator = getValidator(maintenanceDataSchema, dataValidator)
export const maintenanceDataResolver = resolve<Maintenance, HookContext<MaintenanceService>>({})

// Schema for updating existing entries
export const maintenancePatchSchema = Type.Partial(maintenanceSchema, {
  $id: 'MaintenancePatch'
})
export type MaintenancePatch = Static<typeof maintenancePatchSchema>
export const maintenancePatchValidator = getValidator(maintenancePatchSchema, dataValidator)
export const maintenancePatchResolver = resolve<Maintenance, HookContext<MaintenanceService>>({})

// Schema for allowed query properties
export const maintenanceQueryProperties = Type.Pick(maintenanceSchema, ['id', 'asset','type','description','start_date','end_date','status','technician','total_cost'])
export const maintenanceQuerySchema = Type.Intersect(
  [
    querySyntax(maintenanceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MaintenanceQuery = Static<typeof maintenanceQuerySchema>
export const maintenanceQueryValidator = getValidator(maintenanceQuerySchema, queryValidator)
export const maintenanceQueryResolver = resolve<MaintenanceQuery, HookContext<MaintenanceService>>({})
