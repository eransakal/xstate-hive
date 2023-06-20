import inquirer from 'inquirer'
import {Prompt} from '../../utils/prompts-wizard.js'
import {CreateMachineOptions} from './index.js'
import {isStringWithValue} from '../../utils/validators.js'
import {createMachineNamePrompt} from '../../utils/prompts.js'

export const createMachinePrompts = (): Prompt<CreateMachineOptions>[] => {
  return [
    createMachineNamePrompt<CreateMachineOptions>(),
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
