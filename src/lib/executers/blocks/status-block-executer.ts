import {Configuration, MachineConfig} from '../../configuration.js'
import {join} from 'path'
import {formatStateName, toDashCase} from '../../utils.js'
import {extractStatesOfMachine, MachineState} from '../../utils/extract-states-of-machine.js'
import inquirer from 'inquirer'

import {CLIError} from '@oclif/core/lib/errors/index.js'
import {promptStateBlockOptions} from '../../prompt-state-block-options.js'
import {injectStateBlock} from '../../modifiers/inject-state-block.js'
import {getActiveCommand} from '../../active-command.js'
import {PromptsWizard} from '../../prompts/prompts-wizard.js'

const getMachineStates = async (machineName: string, statePath?: string): Promise<MachineState[]> => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  return extractStatesOfMachine(resolvedStateFilePath)
}

interface UserAnswers {
  newStateBlockOptions: any;
  actionType: 'root' | 'child' | 'change';
  selectedState?: string;
  newStateName?: string;
}

function isUserAnswers(data: Partial<UserAnswers>): data is UserAnswers {
  if (!data.actionType || !['root', 'child', 'change'].includes(data.actionType)) {
    throw new CLIError('Action type should be one of [root, child, change]')
  }

  if (!data.newStateBlockOptions) {
    throw new CLIError('New state block options are required')
  }

  if (data.actionType !== 'root' && !data.selectedState) {
    throw new CLIError('Selected state is required for non-root actions')
  }

  if (data.actionType !== 'change' && !data.newStateName) {
    throw new CLIError('New state name is required for non-change actions')
  }

  return true
}

async function getUserInputs({machineStates} : {prefilled: unknown, machineStates: MachineState[] }) {
  return PromptsWizard.run<UserAnswers>({
    validateAnswers: isUserAnswers,
    prompts: [
      {
        propName: 'newStateBlockOptions',
        validate: data => data.newStateBlockOptions ? '' : 'No state block options were provided',
        run: async () => promptStateBlockOptions(),
      },
      {
        propName: 'actionType',
        validate: data => (data.actionType && ['root', 'child', 'change'].includes(data.actionType)) ?
          '' : 'Invalid action type, must be one of [root, child, change]',
        run: async () => (await inquirer.prompt([
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
        ])).value,
      },
      {
        propName: 'selectedState',
        runIf: data => data.actionType !== 'root',
        validate: data => {
          if (typeof data.selectedState !== 'string') {
            return 'Selected state must be a string'
          }

          if (data.actionType === 'change') {
            const selectedStateConfig = machineStates.find(state => state.id === data.selectedState)

            if (selectedStateConfig?.hasContent) {
              return  'The selected state already has content. Support for changing existing state types with content will be added in the future. For now, you can remove the content manually and try again.'
            }
          }
        },
        run: async () => {
          return 2
        },
      },
      {
        propName: 'newStateName',
        runIf: data => data.actionType !== 'change',
        validate: data =>  typeof data.newStateName === 'string' || 'New state name must be a string',
        run: async () =>  formatStateName((await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: 'Enter the name of the new state:',
          },
        ])).value),
      },
    ],
  })
}

export const statusBlockExecuter = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const {error: commandError, debug} = getActiveCommand()

  const {machineName} = machineConfig

  let machineStates: MachineState[] = null!

  try {
    machineStates = await getMachineStates(machineName)
  } catch (error) {
    debug(error)
    commandError(`failed to extract the machine '${machineName}' states, please verify that there are no compile issues and try again.`, {exit: 1})
    return
  }

  const userInputs = await getUserInputs({
    prefilled: {},
    machineStates,
  })

  switch (userInputs.actionType) {
  case 'root':
    await injectStateBlock({
      machineName: machineConfig.machineName,
      selectedStateFilePath: `utils/create-${machineConfig.machineName}-machine.ts`,
      selectedStateParentsInFile: [],
      newStateName: userInputs.newStateName!,
      newStateDirPath: `../machine-states/${toDashCase(userInputs.newStateName!)}-state`,
      newStateOptions: userInputs.newStateBlockOptions,
    })
    break
  case 'child':
  {
    const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

    if (!stateConfig) {
      throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
    }

    await injectStateBlock({
      newStateOptions: userInputs.newStateBlockOptions,
      selectedStateFilePath: stateConfig.filePath,
      selectedStateParentsInFile: stateConfig.innerFileParentStates,
      machineName: machineConfig.machineName,
      newStateName: userInputs.newStateName!,
      newStateDirPath: `./${toDashCase(userInputs.newStateName!)}-state`,
    })
    break
  }

  case 'change':
  {
    const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

    if (!stateConfig) {
      throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
    }

    await injectStateBlock({
      newStateOptions: userInputs.newStateBlockOptions,
      selectedStateFilePath: stateConfig.filePath,
      selectedStateParentsInFile: stateConfig.innerFileParentStates,
      machineName: machineConfig.machineName,
      newStateName: stateConfig.name,
      newStateDirPath: `./${toDashCase(stateConfig.name)}-state`,
    })
    break
  }
  }
}
