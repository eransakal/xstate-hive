import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {OptimisticActionBlockTransformerOptions, validateOptimisticActionBlockTransformerOptions} from './types.js'
import {getActiveCommand} from '../../active-command.js'
import {getStatePath} from '../../utils/paths.js'

export const generateOoptimisticActionBlockTransformer = async (
  options : OptimisticActionBlockTransformerOptions): Promise<void> => {
  const {debug} = getActiveCommand()
  if (!validateOptimisticActionBlockTransformerOptions(options)) {
    throw new Error('Invalid options')
  }

  const projectConfiguration = Configuration.get()

  const destPath = options.parentState.id === '' ? getStatePath(options.parentState, options.stateName) :
    path.dirname(options.parentState.filePath)

  const pathToParentStateInFile = path.relative(options.machineConfig.getAbsolutePath(), destPath)

  debug({
    destPath,
    parentFilePath: options.parentState.filePath,
    pathToParentStateInFile,
  })

  ux.action.start(`generate optimistic action state files in '${projectConfiguration.getRelativePath(destPath)}'`)

  executePlopJSCommand({
    commandPath: 'block/optimistic-action',
    destPath,
    options: {
      stateName: options.stateName,
      machineName: options.machineConfig.machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
      actionVerb: options.actionVerb,
      noun: options.noun,
      contextGuardPropFullPath: options.contextGuardPropFullPath,
      contextPropFullPath: options.contextPropFullPath,
      notificationErrorMessage: options.notificationErrorMessage,
    },
  })
  ux.action.stop()
}
