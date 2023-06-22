import {Configuration} from '../../configuration.js'
import {toDashCase} from '../../utils/formatters.js'
import {executeJSCodeshiftTransformer} from '../../utils/execute-jscodeshift-transformer.js'
import * as path from 'path'
import {ux} from '@oclif/core'
import {InjectStateToMachineOptions, validateInjectStatusToMachineOptions} from './types.js'

export const injectStateTransformer = async (options:  InjectStateToMachineOptions): Promise<void> => {
  if (!validateInjectStatusToMachineOptions(options)) {
    throw new Error('Invalid options')
  }

  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(options.machineName)

  const newStateImportPath = options.parentState.id ?
    `./${toDashCase(options.stateName)}-state` :
    `../machine-states/${toDashCase(options.stateName)}-state`

  ux.action.start(`inject new state '${options.parentState.id}${options.stateName ? `.${options.stateName}` : ''}' in '${path.relative(machineConfig.getAbsolutePath(), options.parentState.filePath)}'`)
  await executeJSCodeshiftTransformer({
    transformerPath: 'states/inject-state-to-machine.ts',
    destFilePath: options.parentState.filePath,
    options: {
      stateName: options.stateName,
      pathToParentStateInFile: options.parentState.innerFileParentStates.join('.'),
      stateImportName: `${options.stateName}State`,
      stateImportPath: newStateImportPath,
    },
  })
  ux.action.stop()
}

