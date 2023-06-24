import {getActiveCommand} from '../../active-command.js'
import {MachineConfig} from '../../configuration.js'
import {MachineState} from '../../utils/get-machine-states.js'

export interface OptimisticActionBlockTransformerOptions {
    machineConfig: MachineConfig,
    noun: string,
    actionVerb: string,
    stateName: string,
    contextPropFullPath: string,
    notificationErrorMessage: string,
    parentState: MachineState,
  }

// eslint-disable-next-line complexity
export function validateOptimisticActionBlockTransformerOptions(options: OptimisticActionBlockTransformerOptions): boolean {
  const {debug} = getActiveCommand()
  const validMachineConfig = Boolean(options.machineConfig)
  const validParentState = typeof options.parentState === 'object' && options.parentState !== null
  const validStateName = typeof options.stateName === 'string' && options.stateName.trim().length > 0
  const validContextPropFullPath = typeof options.contextPropFullPath === 'string' && options.contextPropFullPath.trim().length > 0
  const validNotificationErrorMessage = typeof options.notificationErrorMessage === 'string' && options.notificationErrorMessage.trim().length > 0

  if (!validMachineConfig) {
    debug('Invalid machineConfig:', options.machineConfig)
  }

  if (!validParentState) {
    debug('Invalid parentState:', options.parentState)
  }

  if (!validStateName) {
    debug('Invalid stateName:', options.stateName)
  }

  if (!validContextPropFullPath) {
    debug('Invalid contextPropFullPath:', options.contextPropFullPath)
  }

  if (!validNotificationErrorMessage) {
    debug('Invalid notificationErrorMessage:', options.notificationErrorMessage)
  }

  return validMachineConfig && validParentState && validStateName && validContextPropFullPath && validNotificationErrorMessage
}

