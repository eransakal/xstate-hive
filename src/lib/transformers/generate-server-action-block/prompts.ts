import inquirer from 'inquirer'
import {createStateToModifyPrompt} from '../../prompts/prompts.js'
import {Prompt} from '../../prompts/prompts-wizard.js'
import {isStringWithValue} from '../../utils/validators.js'
import {ServerActionBlockOptions} from './types.js'
import {MachineConfig} from '../../configuration.js'
import {toCamelCase, toPascalCase} from '../../utils/formatters.js'

export const serverActionBlockPrompts = async ({
  machineConfig,
}: {
  machineConfig: MachineConfig,
}): Promise<Prompt<ServerActionBlockOptions>[]> => {
  const promises: (Prompt<ServerActionBlockOptions> | null)[] = [
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

        if (actionVerb === 'Custom') {
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
      propName: 'guardName',
      allowEmptyAnswer: true,
      validate: data => typeof data.guardName === 'string',
      run: async data => {
        const actionRequiresPermission = (await inquirer.prompt([
          {
            type: 'confirm',
            name: 'value',
            message: 'Does this action require a permission (validated by checking a property on the context)?',
          },
        ])).value

        if (actionRequiresPermission) {
          return (await inquirer.prompt([
            {
              type: 'input',
              name: 'value',
              default: `canManage${toPascalCase(data.actionVerb!)}${toPascalCase(data.noun!)}`,
              message: 'Specify the context property to examine within the machine context:',
            },
          ])).value
        }

        return ''
      },
    },
  ]

  return promises.filter(Boolean) as Prompt<ServerActionBlockOptions>[]
}
