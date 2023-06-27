import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {GenerateStatusBlockOptions, validateGenerateStatusBlockOptions} from './types.js'
import {getActiveCommand} from '../../active-command.js'
import {getStateDirPath, getStatePath} from '../../utils/paths.js'

export const generateStatusBlockTransformer = async (
  options : GenerateStatusBlockOptions): Promise<void> => {
  const {debug} = getActiveCommand()
  if (!validateGenerateStatusBlockOptions(options)) {
    throw new Error('Invalid options')
  }

  const projectConfiguration = Configuration.get()

  const destPath = getStateDirPath(options.parentState)
  const pathToParentStateInFile = path.relative(options.machineConfig.getAbsolutePath(), destPath)

  debug({
    destPath,
    parentFilePath: options.parentState.filePath,
    pathToParentStateInFile,
  })

  ux.action.start(`generate new state files in '${projectConfiguration.getRelativePath(destPath)}'`)

  await executePlopJSCommand({
    commandPath: 'block/state',
    destPath,
    options: {
      ...options.innerStateOptions,
      isMachineLoadingState: options.parentState.id === '',
      stateName: options.stateName,
      machineName: options.machineConfig.machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
  ux.action.stop()
}
