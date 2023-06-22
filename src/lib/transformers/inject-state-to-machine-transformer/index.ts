import {Configuration} from '../../configuration.js'
import {toDashCase} from '../../utils/formatters.js'
import {getActiveCommand} from '../../active-command.js'
import {executeJSCodeshiftTransformer} from '../../utils/execute-jscodeshift-transformer.js'
import * as path from 'path'
import {ux} from '@oclif/core'
import {InjectStateToMachineOptions} from './types.js'

export const injectStateTransformer = async (options:  InjectStateToMachineOptions): Promise<void> => {
  const {debug} = getActiveCommand()

  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(options.machineName)

  const newStateImportPath = options.parentState.id ?
    `${toDashCase(options.newStateName)}-state` :
    `../machine-states/${toDashCase(options.newStateName)}-state`

  const absoluteStateFilePath =  path.join(
    machineConfig.getAbsolutePath(),
    options.parentState.filePath,
  )

  ux.action.start(`inject new state '${options.parentState.id}${options.newStateName ? `.${options.newStateName}` : ''}' in '${path.relative(machineConfig.getAbsolutePath(), absoluteStateFilePath)}'`)
  await executeJSCodeshiftTransformer({
    transformerPath: 'states/inject-state-to-machine.ts',
    destFilePath: absoluteStateFilePath,
    options: {
      stateName: options.newStateName,
      pathToParentStateInFile: options.parentState.innerFileParentStates.join('.'),
      stateImportName: `${options.newStateName}State`,
      stateImportPath: newStateImportPath,
    },
  })
  ux.action.stop()
}

