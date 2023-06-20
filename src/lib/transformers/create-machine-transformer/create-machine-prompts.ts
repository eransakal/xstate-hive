import inquirer from 'inquirer'
import {Prompt} from '../../utils/prompts-wizard.js'
import {formatMachineName} from '../../utils/formatters.js'
import {CreateMachineOptions} from './index.js'
import {isStringWithValue} from '../../utils/validators.js'

export const createMachinePrompts = (): Prompt<CreateMachineOptions>[] => {
  return [
    {
      propName: 'machineName',
      validate: data => isStringWithValue(data.machineName) || 'Machine name must be a string',
      run: async () => formatMachineName(
        (await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: 'Enter the name of the new machine:',
          },
        ])).value),
    },
    {
      propName: 'machinePath',
      validate: data => isStringWithValue(data.machinePath) || 'Machine path must be a string',
      run: async data => {
        return (await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: `Enter the directory path to create the '${data.machineName}-machine' folder in:`,
          },
        ])).value
      },
    },
  ]
}
