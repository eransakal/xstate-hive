import {MachineState} from '../../utils/get-machine-states.js'

export interface InjectStateToMachineOptions {
    parentState: MachineState;
    stateName: string;
    forceTypeParallel?: boolean;
  }

export function validateInjectStatusToMachineOptions(options: Partial<InjectStateToMachineOptions>): string | boolean {
  if (!options.parentState) {
    return 'Parent state is required'
  }

  if (!options.stateName) {
    return 'State name is required'
  }

  if (typeof options.forceTypeParallel !== 'undefined' && typeof options.forceTypeParallel !== 'boolean') {
    return 'forceTypeParallel must be a boolean'
  }

  return true
}
