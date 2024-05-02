// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'

export const authentication = async (context: HookContext) => {
  console.log(`Running hook authentication on ${context.path}.${context.method}`)
}
