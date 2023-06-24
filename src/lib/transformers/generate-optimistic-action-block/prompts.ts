import inquirer from 'inquirer'
import {createStateToModifyPrompt} from '../../prompts/prompts.js'
import {Prompt} from '../../prompts/prompts-wizard.js'
import {isStringWithValue} from '../../utils/validators.js'
import {OptimisticActionBlockTransformerOptions} from './types.js'
import {MachineConfig} from '../../configuration.js'
import {toCamelCase, toPascalCase} from '../../utils/formatters.js'

export const optimisticActionBlockTransformerPrompts = async ({
  machineConfig,
}: {
  machineConfig: MachineConfig,
}): Promise<Prompt<OptimisticActionBlockTransformerOptions>[]> => {
  return [
    {
      propName: ['actionVerb', 'noun'],
      validate: data => (isStringWithValue(data.actionVerb) && isStringWithValue(data.noun)) || 'Action verb or noun is not defined',
      postPrompt: async data => {
        data.stateName = `${toCamelCase(data.actionVerb!)}${toPascalCase(data.noun!)}`
      },
      run: async () => {
        let actionVerb =  (await inquirer.prompt([
          {
            type: 'list',
            name: 'value',
            message: 'Enter the verb that best describe the action being set:',
            choices: [
              'Set',
              'Update',
              'Approve',
              'Change',
              'Clear',
              new inquirer.Separator(),
              'Custom',
            ],
          },
        ])).value

        if (actionVerb === 'custom') {
          actionVerb =  (await inquirer.prompt([
            {
              type: 'input',
              name: 'value',
              message: 'Enter the verb that best describe the action being set:',
            },
          ])).value
        }

        const noun =  (await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: 'Enter the noun that best describe the action being set (i.e status, isActive, url):',
          },
        ])).value

        return [toCamelCase(actionVerb), toCamelCase(noun)]
      },
    },
    (await createStateToModifyPrompt(machineConfig)),
    {
      propName: 'contextPropFullPath',
      validate: data => isStringWithValue(data.contextPropFullPath) || 'Context property name is not defined',
      run: async data => (await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          default: data.noun,
          message: 'Enter the machine context property that stores the value:',
        },
      ])).value,
    },
    {
      propName: 'notificationErrorMessage',
      validate: data => isStringWithValue(data.notificationErrorMessage) || 'Notification error message/id is not defined',
      run: async data => (await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          default: `${data.noun}Reverted`,
          message: 'Enter the error message/ID for the notification when an error occurs:',
        },
      ])).value,
    },
  ]
}
