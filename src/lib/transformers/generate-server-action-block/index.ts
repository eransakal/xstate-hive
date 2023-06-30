import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {ServerActionBlockOptions, validateServerActionBlockOptions} from './types.js'
import {getActiveCommand} from '../../active-command.js'
import {getStateDirPath, getStatePath} from '../../utils/paths.js'
import {toDashCase} from '../../utils/formatters.js'

export const generateServerActionBlockTransformer = async (
  options : ServerActionBlockOptions): Promise<void> => {
  const {debug} = getActiveCommand()
  if (!validateServerActionBlockOptions(options)) {
    throw new Error('Invalid options')
  }

  const projectConfiguration = Configuration.get()

  const destPath = options.parentState.id === '' ? getStateDirPath(options.parentState) :
    `${path.dirname(options.parentState.filePath)}/${toDashCase(options.parentState.name)}-states`

  const pathToParentStateInFile = path.relative(options.machineConfig.getAbsolutePath(), destPath)

  debug({
    destPath,
    parentFilePath: options.parentState.filePath,
    pathToParentStateInFile,
  })

  ux.action.start(`generate server action state files in '${projectConfiguration.getRelativePath(destPath)}'`)

  executePlopJSCommand({
    commandPath: 'block/server-action',
    destPath,
    options: {
      stateName: options.stateName,
      machineName: options.machineConfig.machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
      actionVerb: options.actionVerb,
      noun: options.noun,
      guardName: options.guardName,
      useNotifications: options.machineConfig.context.hasNotificationsState,
    },
  })
  ux.action.stop()
}
