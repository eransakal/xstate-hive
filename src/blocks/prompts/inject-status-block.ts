import {Configuration, MachineConfig} from '../../configuration.js'
import {join} from 'path'
import {injectMachineState} from '../../modifiers/inject-machine-state.js'
import {getActiveCommand, getActiveCommandDebug} from '../../active-command.js'
import {toDashCase, toLowerCamelCase} from '../../utils.js'
import {extractStatesOfMachine, MachineState} from '../../utils/extract-states-of-machine.js'
import inquirer from 'inquirer'

import {CLIError} from '@oclif/core/lib/errors/index.js'
import {PromptStateTypeModes, promptStateType} from '../../commands-utils/prompt-state-type.js'

const getMachineStates = async (machineName: string, statePath?: string): Promise<MachineState[]> => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  return extractStatesOfMachine(resolvedStateFilePath)
}

const formatStateName = (stateName: string) => {
  const resolvedStateName = (stateName || '').trim()
  if (!resolvedStateName) {
    return ''
  }

  return  toLowerCamelCase(resolvedStateName).endsWith('State') ? toLowerCamelCase(resolvedStateName).slice(0, -5)  : toLowerCamelCase(resolvedStateName)
}

async function getUserInputs({machineStates} : {prefilled: unknown, machineStates: MachineState[] }) {
  const newStateType = await promptStateType(PromptStateTypeModes.InjectState)

  const actionType = (await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message: 'Select the action to perform:',
      choices: [{
        name: 'Add a new state to the machine root',
        value: 'root',
        short: 'Add Root State',
      },
      {
        name: 'Add a new state to a child state',
        value: 'child',
        short: 'Add Child State',
      },
      {
        name: 'Change an existing state type',
        value: 'change',
        short: 'Change Existing State Type',
      }],
    },
  ])).value

  const selectedState = actionType === 'root' ?
    null :
    (await inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        message: actionType === 'child' ?
          'Select the parent state to add a new state to:' :
          'Select the state to change:',
        choices: machineStates.map(state => state.id),
      },
    ])).value

  const isNewStateNameRequired =  actionType !== 'change'

  if (actionType === 'change') {
    const selectedStateConfig = machineStates.find(state => state.id === selectedState)

    if (selectedStateConfig?.hasContent) {
      throw new CLIError('The selected state already has content. Support for changing existing state types with content will be added in the future. For now, you can remove the content manually and try again.')
    }
  }

  const newStateName = isNewStateNameRequired ? formatStateName((await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: 'Enter the name of the new state:',
    },
  ])).value) : ''

  return {
    actionType,
    selectedState,
    newStateName,
    newStateType,
  }
}

export const injectStatusBlock = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const activeCommand = getActiveCommand()
  const debug = getActiveCommandDebug()

  const {machineName} = machineConfig

  try {
    const machineStates = await getMachineStates(machineName)

    const userInputs = await getUserInputs({
      prefilled: {},
      machineStates,
    })

    if (userInputs.actionType !== 'change' && userInputs.newStateName === '') {
      activeCommand.log('No state name was provided')
      return
    }

    switch (userInputs.actionType) {
    case 'root':
      await injectMachineState({
        machineName: machineConfig.machineName,
        selectedStateFilePath: `utils/create-${machineConfig.machineName}-machine.ts`,
        selectedStateInnerFileParents: [],
        newStateName: userInputs.newStateName,
        newStateType: userInputs.newStateType,
        newStateDirPath: `../machine-states/${toDashCase(userInputs.newStateName)}-state`,
      })
      break
    case 'child':
    {
      const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

      if (!stateConfig) {
        throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
      }

      await injectMachineState({
        newStateType: userInputs.newStateType,
        selectedStateFilePath: stateConfig.filePath,
        selectedStateInnerFileParents: stateConfig.innerFileParentStates,
        machineName: machineConfig.machineName,
        newStateName: userInputs.newStateName,
        newStateDirPath: `./${toDashCase(userInputs.newStateName)}-state`,
      })
      break
    }

    case 'change':
    {
      const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

      if (!stateConfig) {
        throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
      }

      await injectMachineState({
        newStateType: userInputs.newStateType,
        selectedStateFilePath: stateConfig.filePath,
        selectedStateInnerFileParents: stateConfig.innerFileParentStates,
        machineName: machineConfig.machineName,
        newStateName: stateConfig.name,
        newStateDirPath: `./${toDashCase(stateConfig.name)}-state`,
      })
      break
    }
    }
  } catch (error: any) {
    debug(error)
    activeCommand.error(`failed to extract the machine '${machineName}' states, please verify that there are no compile issues and try again.`, {exit: 1})
  }
}