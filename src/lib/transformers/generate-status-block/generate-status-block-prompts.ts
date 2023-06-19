import inquirer from 'inquirer'
import {promptListWithHelp} from '../../utils/prompts.js'
import {Prompt} from '../../utils/prompts-wizard.js'
import {InjectStateOptions} from './index.js'

export interface StateBlockOptions {
  withLoading: boolean,
  stateOffFinal: boolean,
  stateOnName: string,
  stateOffName: string,
}

export const generateStatusBlockPrompts = async ({
  prefilled,
  customLabel,
  defaultValue,
  alwaysOnAvailable,
}: {
  prefilled: Partial<InjectStateOptions>,
  customLabel?: string,
  defaultValue?: string,
  alwaysOnAvailable?: boolean,
}): Promise<Prompt<InjectStateOptions>[]> => {
  const message =  `Choose the statement that best fits the purpose of the ${customLabel || 'state'}:`

  const newStateType = await promptListWithHelp({
    defaultValue: defaultValue || 'alwaysOn',
    message, choices: [
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
  })

  const stateOffFinal = newStateType === 'permanentOnOff'
  const statusesNames: {on: string, off: string} =
  newStateType === 'temporaryOnOff' ? (await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message: 'Choose the statuses names that best describe the purpose of the state:',
      choices: [
        {
          name: 'Active / Inactive',
          value: {on: 'active', off: 'inactive'},
        },
        {
          name: 'Allowed / Not allowed',
          value: {on: 'allowed', off: 'notAllowed'},
        },
        {
          name: 'Visible / Hidden',
          value: {on: 'visible', off: 'hidden'},
        },
        {
          name: 'Enabled / Disabled',
          value: {on: 'enabled', off: 'disabled'},
        },
      ],
    },
  ])).value : {on: 'operational', off: newStateType === 'alwaysOn' ? '' : 'nonOperational'}

  const withLoading = await promptListWithHelp<boolean>({
    defaultValue: true,
    message: `Select data gathering strategy before deciding if the feature is ${statusesNames.on} or not:`,
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
  },
  )

  return {
    stateOffFinal,
    withLoading,
    stateOnName: statusesNames.on,
    stateOffName: statusesNames.off,
  }
}
