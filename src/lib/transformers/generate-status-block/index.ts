import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {GenerateStatusBlockOptions, validateGenerateStatusBlockOptions} from './types.js'
import {toDashCase} from '../../utils/formatters.js'
import {getActiveCommand} from '../../active-command.js'

export const generateStatusBlockTransformer = async (
  options : GenerateStatusBlockOptions): Promise<void> => {
  const {debug} = getActiveCommand()
  if (!validateGenerateStatusBlockOptions(options)) {
    throw new Error('Invalid options')
  }

  const projectConfiguration = Configuration.get()

  const stateRelativePath = options.parentState.id  ?
    `./${toDashCase(options.stateName)}-state` :
    `../machine-states/${toDashCase(options.stateName)}-state`

  const destPath = path.resolve(path.dirname(options.parentState.filePath), stateRelativePath)
  const pathToParentStateInFile = path.relative(options.machineConfig.getAbsolutePath(), destPath)

  debug({
    stateRelativePath,
    destPath,
    parentFilePath: options.parentState.filePath,
    pathToParentStateInFile,
  })

  ux.action.start(`generate new state files in '${pathToParentStateInFile}'`)

  await executePlopJSCommand({
    commandPath: 'block/state',
    destPath,
    options: {
      ...options.innerStateOptions,
      stateName: options.stateName,
      machineName: options.machineConfig.machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
  ux.action.stop()
}
