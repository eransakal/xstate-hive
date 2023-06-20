import {isStringWithValue} from '../../utils/validators.js'

export interface InjectStateToMachineOptions {
    actionType: 'root' | 'child' | 'change';
    selectedState?: string;
    newStateName?: string;
  }

export function validateInjectStatusToMachineOptions(options: any): string | boolean {
  if (!isStringWithValue(options.actionType) || !['root', 'child', 'change'].includes(options.actionType)) {
    return 'Action type should be one of [root, child, change]'
  }

  if (options.actionType !== 'root' && isStringWithValue(options.selectedState)) {
    return 'Selected state is required for non-root actions'
  }

  if (options.actionType !== 'change' && isStringWithValue(options.newStateName)) {
    return 'New state name is required for non-change actions'
  }

  return true
}
