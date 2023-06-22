import {MachineState} from '../../utils/get-machine-states.js'
import {isStringWithValue} from '../../utils/validators.js'

export interface InjectStateToMachineOptions {
    machineName: string,
    parentState: MachineState;
    stateName: string;
  }

export function validateInjectStatusToMachineOptions(options: Partial<InjectStateToMachineOptions>): string | boolean {
  if (!options.parentState) {
    return 'Parent state is required'
  }

  if (!options.stateName) {
    return 'State name is required'
  }

  if (!isStringWithValue(options.machineName)) {
    return 'Machine name is required'
  }

  return true
}
