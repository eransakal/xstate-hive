import * as path from 'path'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {ux} from '@oclif/core'
import {Configuration} from '../../configuration.js'
import {GenerateStatusBlockOptions} from './types.js'
import {toDashCase} from '../../utils/formatters.js'

export const generateStatusBlockTransformer = async (
  options : GenerateStatusBlockOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(options.machineName)

  const statePath = path.join(options.destPath, `${options.stateName}-state`)
  const pathToParentStateInFile = path.relative(machineConfig.getAbsolutePath(), statePath)
  ux.action.start(`generate new state files in '${pathToParentStateInFile}'`)

  await executePlopJSCommand({
    commandPath: 'block/state',
    destPath: path.join(options.destPath, `${toDashCase(options.stateName)}-state`),
    options: {
      ...options.innerStateOptions,
      stateName: options.stateName,
      machineName: options.machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
  ux.action.stop()
}
