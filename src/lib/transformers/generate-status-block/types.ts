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
    stateName: string,
    destPath: string
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
  const validDestPath = typeof options.destPath === 'string' && options.destPath.trim().length > 0
  const validStateName = typeof options.stateName === 'string' && options.stateName.trim().length > 0

  if (!validMachineName) {
    debug('Invalid machineName:', options.machineName)
  }

  if (!validStatePurpose) {
    debug('Invalid statePurpose:', options.statePurpose)
  }

  if (!validInnerStateOptions) {
    debug('Invalid innerStateOptions:', options.innerStateOptions)
  }

  if (!validDestPath) {
    debug('Invalid destPath:', options.destPath)
  }

  if (!validStateName) {
    debug('Invalid stateName:', options.stateName)
  }

  return validMachineName && validStatePurpose && validInnerStateOptions &&
  validDestPath && validStateName
}

