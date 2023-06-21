import inquirer from 'inquirer'
import {createMachineNamePrompt, promptListWithHelp} from '../../utils/prompts.js'
import {Prompt} from '../../utils/prompts-wizard.js'
import {isStringWithValue} from '../../utils/validators.js'
import {GenerateStatusBlockOptions} from './types.js'
import {formatStateName} from '../../utils/formatters.js'

export const generateStatusBlockPrompts = ({
  customLabel,
  defaultValue,
  alwaysOnAvailable,
  postNewStateNamePrompt,
}: {
  customLabel?: string,
  defaultValue?: string,
  alwaysOnAvailable?: boolean,
  postNewStateNamePrompt?: (data: Partial<GenerateStatusBlockOptions>) => Promise<void>,
}): Prompt<GenerateStatusBlockOptions>[] => {
  return [
    createMachineNamePrompt<GenerateStatusBlockOptions>(),
    {
      propName: 'newStateName',
      validate: data =>  typeof data.newStateName === 'string' || 'New state name must be a string',
      run: async () =>  formatStateName((await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          message: 'Enter the name of the new state:',
        },
      ])).value),
      postPrompt: postNewStateNamePrompt,
    },
    {
      propName: 'newStateFolderPath',
      validate: data =>  typeof data.newStateFolderPath === 'string' || 'New state folder must be a string',
      run: async () =>  formatStateName((await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          message: 'Enter the new state folder path in the machine:',
        },
      ])).value),
    },
    {
      propName: 'statePurpose',
      validate: data => isStringWithValue(data.statePurpose) || 'State purpose is not valid',
      run: async () =>  promptListWithHelp({
        defaultValue: defaultValue || 'alwaysOn',
        message: `Choose the statement that best fits the purpose of the ${customLabel || 'state'}:`,
        choices: [
          ...(alwaysOnAvailable ? [{
            name: 'Maintain a fixed state of always on status',
            value: 'alwaysOn',
          }] : []),
          {
            name: 'Dynamically toggle between on and off statuses based on conditions',
            value: 'temporaryOnOff',
          },
          {
            name: 'Maintain a fixed state of either on or off statuses based on conditions',
            value: 'permanentOnOff',
          },
        ], helpLink: 'https://sakalim.com/projects/react-architecture/application-state-with-xstate-4-guides-statuses-blocks#state-types',
      }),
    },
    {
      propName: 'innerStateOptions.stateOffFinal',
      validate: data => typeof data.innerStateOptions?.stateOffFinal === 'boolean' || 'State off final is not defined',
      run: async data => data.statePurpose === 'permanentOnOff',
    },
    {
      propName: ['innerStateOptions.stateOnName', 'innerStateOptions.stateOffName'],
      validate: data => isStringWithValue(data.innerStateOptions?.stateOnName) || 'State on is not defined',
      run: async data => {
        return data.statePurpose === 'temporaryOnOff' ? (await inquirer.prompt([
          {
            type: 'list',
            name: 'value',
            message: 'Choose the statuses names that best describe the purpose of the state:',
            choices: [
              {
                name: 'Active / Inactive',
                value: ['active', 'inactive'],
              },
              {
                name: 'Allowed / Not allowed',
                value: ['allowed', 'notAllowed'],
              },
              {
                name: 'Visible / Hidden',
                value: ['visible', 'hidden'],
              },
              {
                name: 'Enabled / Disabled',
                value: ['enabled', 'disabled'],
              },
            ],
          },
        ])).value :
          ['operational', data.statePurpose === 'alwaysOn' ? '' : 'nonOperational']
      },
    },
    {
      propName: 'innerStateOptions.includeLoadingState',
      validate: data => typeof data.innerStateOptions?.includeLoadingState === 'boolean' || 'With loading is not defined',
      run: async data => promptListWithHelp<boolean>({
        defaultValue: true,
        message: `Select data gathering strategy before deciding if the feature is ${data.innerStateOptions?.stateOnName} or not:`,
        choices: [
          {
            name: 'Data gathering required. Feature\'s status not always immediately known',
            value: true,
            short: 'Require data gathering',
          },
          {
            name: 'No data gathering required. machine\'s status always immediately known',
            value: false,
            short: 'No data gathering required',
          },
        ],
        helpLink: 'https://sakalim.com/projects/react-architecture/application-state-with-xstate-4-guides-statuses-blocks#data-gathering',
      }),
    },
  ]
}
