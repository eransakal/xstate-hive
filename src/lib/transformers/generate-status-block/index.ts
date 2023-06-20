import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {getActiveCommand} from '../../active-command.js'
import {isStringWithValue} from '../../utils/validators.js'

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
  newStateDirPath: string
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
    typeof innerStateOptions.stateOffName === 'string' && innerStateOptions.stateOffName.trim().length > 0
  const validParentStateFilePath = typeof options.parentStateFilePath === 'string' && options.parentStateFilePath.trim().length > 0
  const validNewStateName = typeof options.newStateName === 'string' && options.newStateName.trim().length > 0
  const validNewStateDirPath = typeof options.newStateDirPath === 'string' && options.newStateDirPath.trim().length > 0

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

  if (!validNewStateDirPath) {
    debug('Invalid newStateDirPath:', options.newStateDirPath)
  }

  return validMachineName && validStatePurpose && validInnerStateOptions &&
    validParentStateFilePath && validNewStateName && validNewStateDirPath
}

export const generateStatusBlockTransformer = async (
  options : GenerateStatusBlockOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(options.machineName)

  const resolvedParentStateFilePath = path.isAbsolute(options.parentStateFilePath) ? options.parentStateFilePath : path.join(
    machineConfig.getAbsolutePath(),
    options.parentStateFilePath,
  )

  const resolvedNewStatefolderPath = path.resolve(path.dirname(resolvedParentStateFilePath), options.newStateDirPath)

  const pathToParentStateInFile = path.relative(machineConfig.getAbsolutePath(), resolvedNewStatefolderPath)
  ux.action.start(`generate new state '${options.newStateName}' files in '${path.relative(machineConfig.getRoot(), resolvedNewStatefolderPath)}'`)
  await executePlopJSCommand({
    commandPath: 'block/state',
    destPath: resolvedNewStatefolderPath,
    options: {
      ...options.innerStateOptions,
      stateName: options.newStateName,
      machineName: options.machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
  ux.action.stop()

  // const stateFilePathForUX = path.relative(machineConfig.getRoot(), absoluteStateFilePath)
  // ux.action.start(`inject new state '${newStateName}' in '${stateFilePathForUX}'`)
  // await executeJSCodeshiftTransformer({
  //   transformerPath: 'states/inject-state-to-machine.ts',
  //   destFilePath: absoluteStateFilePath,
  //   options: {
  //     stateName: newStateName,
  //     pathToParentStateInFile: selectedStateParentsInFile.join('.'),
  //     stateImportName: `${newStateName}State`,
  //     stateImportPath: newStateDirPath,
  //   },
  // })
  // ux.action.stop()
}
