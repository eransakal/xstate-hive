import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration'

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
