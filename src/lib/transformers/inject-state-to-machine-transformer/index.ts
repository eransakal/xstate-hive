import {Configuration} from '../../configuration.js'
import {toDashCase} from '../../utils/formatters.js'
import {getActiveCommand} from '../../active-command.js'
import {executeJSCodeshiftTransformer} from '../../utils/execute-jscodeshift-transformer.js'
import * as path from 'path'
import {ux} from '@oclif/core'
import {MachineState, getMachineStates} from '../../utils/get-machine-states.js'
import {isStringWithValue} from '../../utils/validators.js'

export interface InjectStateToMachineOptions {
  actionType: 'root' | 'child' | 'change';
  selectedState?: string;
  newStateName?: string;
}

export function validateInjectStatusToMachineOptions(options: any): string | boolean {
  if (!isStringWithValue(options.actionType) || !['root', 'child', 'change'].includes(options.actionType)) {
    return 'Action type should be one of [root, child, change]'
  }

  if (options.actionType !== 'root' && isStringWithValue(options.selectedState)) {
    return 'Selected state is required for non-root actions'
  }

  if (options.actionType !== 'change' && isStringWithValue(options.newStateName)) {
    return 'New state name is required for non-change actions'
  }

  return true
}

const run = async (
  options : {
    machineName: string,
    selectedStateFilePath: string;
    selectedStateParentsInFile: string[]
    newStateName: string;
    newStateDirPath: string;
  }): Promise<void> => {
  const {
    machineName,
    selectedStateFilePath,
    selectedStateParentsInFile,
    newStateName,
    newStateDirPath,
  } = options
  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(machineName)

  const absoluteStateFilePath = path.isAbsolute(selectedStateFilePath) ? selectedStateFilePath : path.join(
    machineConfig.getAbsolutePath(),
    selectedStateFilePath,
  )

  const stateFilePathForUX = path.relative(machineConfig.getRoot(), absoluteStateFilePath)

  ux.action.start(`inject new state '${newStateName}' in '${stateFilePathForUX}'`)
  await executeJSCodeshiftTransformer({
    transformerPath: 'states/inject-state-to-machine.ts',
    destFilePath: absoluteStateFilePath,
    options: {
      stateName: newStateName,
      pathToParentStateInFile: selectedStateParentsInFile.join('.'),
      stateImportName: `${newStateName}State`,
      stateImportPath: newStateDirPath,
    },
  })
  ux.action.stop()
}

export function validateStatusBlockPrompts(data: Partial<InjectStateToMachineOptions>): string | boolean  {
  if (!data.actionType || !['root', 'child', 'change'].includes(data.actionType)) {
    return 'Action type should be one of [root, child, change]'
  }

  if (data.actionType !== 'root' && !data.selectedState) {
    return 'Selected state is required for non-root actions'
  }

  if (data.actionType !== 'change' && !data.newStateName) {
    return 'New state name is required for non-change actions'
  }

  return true
}

export const injectStateTransformer = async (options:  InjectStateToMachineOptions & { machineName: string}): Promise<void> => {
  const {error: commandError, debug} = getActiveCommand()

  let machineStates: MachineState[] = null!

  try {
    machineStates = await getMachineStates(options.machineName)
  } catch (error) {
    debug(error)
    commandError(`failed to extract the machine '${options.machineName}' states, please verify that there are no compile issues and try again.`, {exit: 1})
    return
  }

  switch (options.actionType) {
  case 'root':
    if (!options.newStateName) {
      throw new Error('newStateName is required for root action')
    }

    await run({
      machineName: options.machineName,
      selectedStateFilePath: `utils/create-${options.machineName}-machine.ts`,
      selectedStateParentsInFile: [],
      newStateName: options.newStateName,
      newStateDirPath: `../machine-states/${toDashCase(options.newStateName!)}-state`,
    })
    break
  case 'child':
  {
    const stateConfig = machineStates.find(state => state.id === options.selectedState)

    if (!stateConfig) {
      throw new Error(`state '${options.selectedState}' not found in '${options.machineName}'`)
    }

    await run({
      selectedStateFilePath: stateConfig.filePath,
      selectedStateParentsInFile: stateConfig.innerFileParentStates,
      machineName: options.machineName,
      newStateName: options.newStateName!,
      newStateDirPath: `./${toDashCase(options.newStateName!)}-state`,
    })
    break
  }

  case 'change':
  {
    const stateConfig = machineStates.find(state => state.id === options.selectedState)

    if (!stateConfig) {
      throw new Error(`state '${options.selectedState}' not found in '${options.machineName}'`)
    }

    await run({
      selectedStateFilePath: stateConfig.filePath,
      selectedStateParentsInFile: stateConfig.innerFileParentStates,
      machineName: options.machineName,
      newStateName: stateConfig.name,
      newStateDirPath: `./${toDashCase(stateConfig.name)}-state`,
    })
    break
  }
  }
}

