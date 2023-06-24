import {getActiveCommand} from '../../active-command.js'
import {MachineConfig} from '../../configuration.js'
import {MachineState} from '../../utils/get-machine-states.js'

export interface GenerateStatusBlockOptions {
    machineConfig: MachineConfig,
    statePurpose: 'alwaysOn' | 'temporaryOnOff' | 'permanentOnOff',
    innerStateOptions: {
      includeLoadingState: boolean,
      stateOffFinal: boolean,
      stateOnName: string,
      stateOffName: string,
    },
    stateName: string,
    parentState: MachineState,
  }

// eslint-disable-next-line complexity
export function validateGenerateStatusBlockOptions(options: GenerateStatusBlockOptions): boolean {
  const {debug} = getActiveCommand()
  const validMachineConfig =  Boolean(options.machineConfig)
  const validStatePurpose = ['alwaysOn', 'temporaryOnOff', 'permanentOnOff'].includes(options.statePurpose)
  const innerStateOptions = options.innerStateOptions
  const validInnerStateOptions = typeof innerStateOptions === 'object' &&
      typeof innerStateOptions.includeLoadingState === 'boolean' &&
      typeof innerStateOptions.stateOffFinal === 'boolean' &&
      typeof innerStateOptions.stateOnName === 'string' && innerStateOptions.stateOnName.trim().length > 0 &&
      typeof innerStateOptions.stateOffName === 'string'
  const validParentState = typeof options.parentState === 'object' && options.parentState !== null

  if (!validMachineConfig) {
    debug('Invalid machineConfig:', options.machineConfig)
  }

  if (!validStatePurpose) {
    debug('Invalid statePurpose:', options.statePurpose)
  }

  if (!validInnerStateOptions) {
    debug('Invalid innerStateOptions:', options.innerStateOptions)
  }

  if (!validParentState) {
    debug('Invalid parentState:', options.parentState)
  }

  return validMachineConfig && validStatePurpose && validInnerStateOptions &&
  validParentState
}

