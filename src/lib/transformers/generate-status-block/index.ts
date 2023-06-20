import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {getActiveCommand} from '../../active-command.js'

export interface GenerateStatusBlockOptions {
  machineName: string,
  statePurpose: 'alwaysOn' | 'temporaryOnOff' | 'permanentOnOff',
  innerStateOptions: {
    withLoading: boolean,
    stateOffFinal: boolean,
    stateOnName: string,
    stateOffName: string,
  },
  selectedStateFilePath: string;
  // selectedStateParentsInFile: string[]
  newStateName: string;
  newStateDirPath: string;
}

export function validateGenerateStatusBlockOptions(options: GenerateStatusBlockOptions): boolean {
  const {debug} = getActiveCommand()
  const validMachineName = typeof options.machineName === 'string'
  const validStatePurpose = ['alwaysOn', 'temporaryOnOff', 'permanentOnOff'].includes(options.statePurpose)
  const validInnerStateOptions = typeof options.innerStateOptions === 'object' &&
    typeof options.innerStateOptions.withLoading === 'boolean' &&
    typeof options.innerStateOptions.stateOffFinal === 'boolean' &&
    typeof options.innerStateOptions.stateOnName === 'string' &&
    typeof options.innerStateOptions.stateOffName === 'string'
  const validSelectedStateFilePath = typeof options.selectedStateFilePath === 'string'
  const validNewStateName = typeof options.newStateName === 'string'
  const validNewStateDirPath = typeof options.newStateDirPath === 'string'

  if (!validMachineName) {
    debug('Invalid machineName:', options.machineName)
  }

  if (!validStatePurpose) {
    debug('Invalid statePurpose:', options.statePurpose)
  }

  if (!validInnerStateOptions) {
    debug('Invalid innerStateOptions:', options.innerStateOptions)
  }

  if (!validSelectedStateFilePath) {
    debug('Invalid selectedStateFilePath:', options.selectedStateFilePath)
  }

  if (!validNewStateName) {
    debug('Invalid newStateName:', options.newStateName)
  }

  if (!validNewStateDirPath) {
    debug('Invalid newStateDirPath:', options.newStateDirPath)
  }

  return validMachineName && validStatePurpose && validInnerStateOptions &&
    validSelectedStateFilePath && validNewStateName && validNewStateDirPath
}

export const generateStatusBlockTransformer = async (
  options : GenerateStatusBlockOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(options.machineName)

  const absoluteStateFilePath = path.isAbsolute(options.selectedStateFilePath) ? options.selectedStateFilePath : path.join(
    machineConfig.getAbsolutePath(),
    options.selectedStateFilePath,
  )

  const absoluteNewStatePath = path.resolve(path.dirname(absoluteStateFilePath), options.newStateDirPath)
  const newStatePathForUX = path.relative(machineConfig.getRoot(), absoluteNewStatePath)

  const pathToParentStateInFile = path.relative(machineConfig.getAbsolutePath(), absoluteNewStatePath)
  ux.action.start(`generate new state '${options.newStateName}' files in '${newStatePathForUX}'`)
  await executePlopJSCommand({
    commandPath: 'block/state',
    destPath: absoluteNewStatePath,
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
