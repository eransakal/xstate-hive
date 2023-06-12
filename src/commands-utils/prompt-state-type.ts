import inquirer from 'inquirer'
import {StateTypes} from '../data.js'

export enum PromptStateTypeModes {
    CreateMachine,
    InjectState
}
export const promptStateType = async (mode: PromptStateTypeModes): Promise<StateTypes> => {
  const message = mode === PromptStateTypeModes.CreateMachine ?
    'Choose the machine availability:' :
    'Choose the state type that best fits the purpose:'

  let newStateType = (await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message,
      choices: [
        ...(mode === PromptStateTypeModes.CreateMachine ? [{
          name: 'Always operational',
          value: StateTypes.Operational,
        }] : []),
        {
          name: 'Dynamically toggle between allowed and not allowed statuses based on conditions',
          value: StateTypes.AllowedNotAllowed,
        },
        {
          name: 'Maintain a fixed state of either operational or non-operational statuses based on conditions',
          value: 'operational-non-operational',
        },
        // ...(mode === PromptStateTypeModes.CreateMachine ? [
        //   new inquirer.Separator(),
        //   {
        //   name: 'Manage an asynchronously optimistic action performed by the user',
        //   value: StateTypes.Operational,
        // }] : []),
        new inquirer.Separator(),
        {
          name: 'I\'m not sure what to choose, please assist me',
          value: 'help',
        },
      ],
    },
  ])).value

  if (newStateType === 'help') {
    // TODO
  }

  if (newStateType === 'operational-non-operational' ||
      newStateType === 'allowed-not-allowed') {
    const actionLabel = newStateType === 'operational-non-operational' ? 'operational' : 'allowed'
    const {withLoading} = await inquirer.prompt([
      {
        type: 'list',
        name: 'withLoading',
        message: `Select data gathering strategy before deciding if the feature is ${actionLabel} or not:`,
        choices: [
          {
            name: 'Data gathering required. Feature\'s status not always immediately known',
            value: 'yes',
            short: 'Require data gathering',
          },
          {
            name: 'No data gathering required. machine\'s status always immediately known',
            value: 'no',
            short: 'No data gathering required',
          },
          new inquirer.Separator(),
          {
            name: 'I\'m not sure what to choose, please assist me',
            value: 'help',
          },
        ],
      },
    ])

    if (withLoading === 'yes') {
      newStateType += '-with-loading'
    }

    if (withLoading === 'help') {
      // TODO
    }
  }

  return newStateType as StateTypes
}
