import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {GenerateStatusBlockOptions} from './types.js'

export const generateStatusBlockTransformer = async (
  options : GenerateStatusBlockOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(options.machineName)

  const resolvedParentStateFilePath = path.isAbsolute(options.parentStateFilePath) ? options.parentStateFilePath : path.join(
    machineConfig.getAbsolutePath(),
    options.parentStateFilePath,
  )

  const resolvedNewStateFolderPath = path.resolve(path.dirname(resolvedParentStateFilePath), options.newStateFolderPath)

  const pathToParentStateInFile = path.relative(machineConfig.getAbsolutePath(), resolvedNewStateFolderPath)
  ux.action.start(`generate new state '${options.newStateName}' files in '${path.relative(machineConfig.getRoot(), resolvedNewStateFolderPath)}'`)
  await executePlopJSCommand({
    commandPath: 'block/state',
    destPath: resolvedNewStateFolderPath,
    options: {
      ...options.innerStateOptions,
      stateName: options.newStateName,
      machineName: options.machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
  ux.action.stop()
}
