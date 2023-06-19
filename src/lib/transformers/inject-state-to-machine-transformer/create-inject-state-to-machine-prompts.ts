import inquirer from 'inquirer'
import {Prompt} from '../../utils/prompts-wizard.js'
import {formatStateName} from '../../utils/formatters.js'
import {getMachineStates} from '../../utils/get-machine-states.js'
import {InjectStateToMachineOptions} from './index.js'
import {MachineConfig} from '../../configuration.js'

export const createInjectStateToMachinePrompts = async ({machineConfig}: {
  machineConfig: MachineConfig
}): Promise<Prompt<InjectStateToMachineOptions>[]> => {
  const machineStates = await getMachineStates(machineConfig.machineName)
  return [
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
      run: async data => {
        return  (await inquirer.prompt([
          {
            type: 'list',
            name: 'value',
            message: data.actionType === 'child' ?
              'Select the parent state to add a new state to:' :
              'Select the state to change:',
            choices: machineStates.map(state => state.id),
          },
        ])).value
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
  ]
}
