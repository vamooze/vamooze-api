// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  BusinessSettings,
  BusinessSettingsData,
  BusinessSettingsPatch,
  BusinessSettingsQuery,
  BusinessSettingsService
} from './business-settings.class'

export type { BusinessSettings, BusinessSettingsData, BusinessSettingsPatch, BusinessSettingsQuery }

export type BusinessSettingsClientService = Pick<
  BusinessSettingsService<Params<BusinessSettingsQuery>>,
  (typeof businessSettingsMethods)[number]
>

export const businessSettingsPath = 'business-settings'

export const businessSettingsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const businessSettingsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(businessSettingsPath, connection.service(businessSettingsPath), {
    methods: businessSettingsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [businessSettingsPath]: BusinessSettingsClientService
  }
}
