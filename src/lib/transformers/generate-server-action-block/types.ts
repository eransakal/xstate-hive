import {getActiveCommand} from '../../active-command.js'
import {MachineConfig} from '../../configuration.js'
import {MachineState} from '../../utils/get-machine-states.js'

export interface ServerActionBlockOptions {
    machineConfig: MachineConfig,
    noun: string,
    actionVerb: string,
    stateName: string,
    guardName?: string,
    useNotifications?: boolean | null,
    parentState: MachineState,
  }

// eslint-disable-next-line complexity
export function validateServerActionBlockOptions(options: ServerActionBlockOptions): boolean {
  const {debug} = getActiveCommand()
  const validMachineConfig = Boolean(options.machineConfig)
  const validParentState = typeof options.parentState === 'object' && options.parentState !== null

  if (!validMachineConfig) {
    debug('Invalid machineConfig:', options.machineConfig)
  }

  if (!validParentState) {
    debug('Invalid parentState:', options.parentState)
  }

  return validMachineConfig && validParentState
}

