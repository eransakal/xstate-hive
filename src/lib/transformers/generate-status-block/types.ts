import {getActiveCommand} from '../../active-command.js'

export interface GenerateStatusBlockOptions {
    machineName: string,
    statePurpose: 'alwaysOn' | 'temporaryOnOff' | 'permanentOnOff',
    innerStateOptions: {
      includeLoadingState: boolean,
      stateOffFinal: boolean,
      stateOnName: string,
      stateOffName: string,
    },
    parentStateFilePath: string;
    newStateName: string;
    newStateFolderPath: string
  }

// eslint-disable-next-line complexity
export function validateGenerateStatusBlockOptions(options: GenerateStatusBlockOptions): boolean {
  const {debug} = getActiveCommand()
  const validMachineName =  typeof options.machineName === 'string' && options.machineName.trim().length > 0
  const validStatePurpose = ['alwaysOn', 'temporaryOnOff', 'permanentOnOff'].includes(options.statePurpose)
  const innerStateOptions = options.innerStateOptions
  const validInnerStateOptions = typeof innerStateOptions === 'object' &&
      typeof innerStateOptions.includeLoadingState === 'boolean' &&
      typeof innerStateOptions.stateOffFinal === 'boolean' &&
      typeof innerStateOptions.stateOnName === 'string' && innerStateOptions.stateOnName.trim().length > 0 &&
      typeof innerStateOptions.stateOffName === 'string'
  const validParentStateFilePath = typeof options.parentStateFilePath === 'string' && options.parentStateFilePath.trim().length > 0
  const validNewStateName = typeof options.newStateName === 'string' && options.newStateName.trim().length > 0
  const validNewStateFolderPath = typeof options.newStateFolderPath === 'string' && options.newStateFolderPath.trim().length > 0

  if (!validMachineName) {
    debug('Invalid machineName:', options.machineName)
  }

  if (!validStatePurpose) {
    debug('Invalid statePurpose:', options.statePurpose)
  }

  if (!validInnerStateOptions) {
    debug('Invalid innerStateOptions:', options.innerStateOptions)
  }

  if (!validParentStateFilePath) {
    debug('Invalid parentStateFilePath:', options.parentStateFilePath)
  }

  if (!validNewStateName) {
    debug('Invalid newStateName:', options.newStateName)
  }

  if (!validNewStateFolderPath) {
    debug('Invalid newStateFolderPath:', options.newStateFolderPath)
  }

  return validMachineName && validStatePurpose && validInnerStateOptions &&
      validParentStateFilePath && validNewStateName && validNewStateFolderPath
}

