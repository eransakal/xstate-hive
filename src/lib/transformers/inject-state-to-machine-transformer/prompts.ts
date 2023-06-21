import inquirer from 'inquirer'
import {Prompt} from '../../utils/prompts-wizard.js'
import {formatStateName} from '../../utils/formatters.js'
import {getMachineStates} from '../../utils/get-machine-states.js'
import {InjectStateToMachineOptions} from './types.js'
import {MachineConfig} from '../../configuration.js'
import {createMachineNamePrompt} from '../../utils/prompts.js'

export const createInjectStateToMachinePrompts = async ({machineConfig}: {
  machineConfig: MachineConfig
}): Promise<Prompt<InjectStateToMachineOptions>[]> => {
  const machineStates = await getMachineStates(machineConfig.machineName)
  return [
    createMachineNamePrompt(),
    {
      propName: ['parentState', 'newStateName'],
      validate: ({parentState, newStateName}) => parentState &&
      newStateName !== null && typeof newStateName !== 'undefined',
      run: async () => {
        let newStateName = ''
        let parentStateName = ''

        const action = (await inquirer.prompt([
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

        if (action !== 'root') {
          parentStateName = (await inquirer.prompt([
            {
              type: 'list',
              name: 'value',
              message: action === 'child' ?
                'Select the parent state to add a new state to:' :
                'Select the state to change:',
              choices: machineStates.map(state => state.id),
            },
          ])).value
        }

        if (action !== 'change') {
          newStateName = formatStateName((await inquirer.prompt([
            {
              type: 'input',
              name: 'value',
              message: 'Enter the name of the new state:',
            },
          ])).value)
        }

        return [parentStateName, newStateName]
      },
    },
  ]
}
