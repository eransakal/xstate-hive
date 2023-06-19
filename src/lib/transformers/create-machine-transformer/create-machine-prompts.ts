import inquirer from 'inquirer'
import {Prompt} from '../../utils/prompts-wizard.js'
import {formatMachineName} from '../../utils.js'
import {CreateMachineOptions} from './index.js'
import {isStringWithValue} from '../../utils/validators.js'

export const createMachinePrompts = (prefilled: Partial<CreateMachineOptions>): Prompt<CreateMachineOptions>[] => {
  return [
    {
      propName: 'machineName',
      validate: data => isStringWithValue(data.machineName) || 'Machine name must be a string',
      run: async () => formatMachineName(
        prefilled.machineName || (await inquirer.prompt([
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
        return  prefilled.machinePath || (await inquirer.prompt([
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
