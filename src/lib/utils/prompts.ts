import inquirer from 'inquirer'
import {getActiveCommand} from '../active-command.js'
import open from 'open'
import {Prompt} from './prompts-wizard.js'
import {formatMachineName, formatStateName} from './formatters.js'
import {isStringWithValue} from './validators.js'
import {MachineState, getMachineStates} from './get-machine-states.js'
import {MachineConfig} from '../configuration.js'

export const promptListWithHelp = async <T>({defaultValue, message, choices, helpLink}: { defaultValue:T, message: string; choices: inquirer.prompts.PromptOptions['choices']['choices']; helpLink: string }): Promise<T> => {
  let result: T = null!

  let stopped = false

  while (!stopped) {
    // eslint-disable-next-line no-await-in-loop
    result = (await inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        default: defaultValue,
        message,
        choices: [
          ...choices,
          new inquirer.Separator(),
          {
            name: 'I\'m not sure what to choose, please assist me',
            value: 'help',
          },
        ],
      },
    ])).value

    if (result === 'help') {
      const {log} = getActiveCommand()
      log(`please visit '${helpLink}' for more information`)
      open(helpLink)
    } else {
      stopped = true
    }
  }

  return result
}

export const createMachineNamePrompt = <T extends { machineName: string}>(): Prompt<T> => {
  const result: Prompt<{ machineName: string }> = {
    propName: 'machineName',
    validate: data => isStringWithValue(data.machineName) || 'Machine name must be a string',
    run: async () => formatMachineName(
      (await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          message: 'Enter a machine name',
        },
      ])).value),
  }

  return result
}

export const createStateToModifyPrompt = async (machineConfig: MachineConfig): Promise<Prompt<{
  parentState: MachineState,
  stateName: string
}>> => {
  const machineStates = await getMachineStates(machineConfig.machineName)
  return {
    propName: ['parentState', 'stateName'],
    validate: ({parentState, stateName}) => parentState &&
    stateName !== null && typeof stateName !== 'undefined',
    run: async () => {
      let stateName = ''
      let parentState: MachineState | null = null

      const action = (await inquirer.prompt([
        {
          type: 'list',
          name: 'value',
          message: 'Select the action to perform:',
          choices: [
            {
              name: 'Add a new state to a child state',
              value: 'child',
              short: 'Add Child State',
            },
            {
              name: 'Add a new state to the machine root',
              value: 'root',
              short: 'Add Root State',
            },
            {
              name: 'Change an existing state type',
              value: 'change',
              short: 'Change Existing State Type',
            },
          ],
        },
      ])).value

      if (action === 'root') {
        parentState = machineStates.find(state => !state.id)!
      } else {
        parentState = (await inquirer.prompt([
          {
            type: 'list',
            name: 'value',
            message: action === 'child' ?
              'Select the parent state to add a new state to:' :
              'Select the state to change:',
            choices: machineStates.filter(state => state.id).map(state => {
              return {
                name: state.id,
                value: state,
              }
            }),
          },
        ])).value
      }

      if (action !== 'change') {
        stateName = formatStateName((await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: 'Enter the name of the new state:',
          },
        ])).value)
      }

      return [parentState, stateName]
    },
  }
}
