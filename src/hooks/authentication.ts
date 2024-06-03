// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'
import {logger} from "../logger";

export const authentication = async (context: HookContext) => {
  logger.info(`Running hook authentication on ${context.path}.${context.method}`)
}
