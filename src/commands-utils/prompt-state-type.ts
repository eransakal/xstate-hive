import inquirer from 'inquirer'
import {StateTypes} from '../data.js'

export enum PromptStateTypeModes {
    CreateMachine,
    InjectState
}
export const promptStateType = async (mode: PromptStateTypeModes): Promise<StateTypes> => {
  const message = mode === PromptStateTypeModes.CreateMachine ?
    'What is the availabilty of the machine?' :
    'Which type fit best the purpose of the new state?'

  let newStateType = (await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message,
      choices: [
        ...(mode === PromptStateTypeModes.CreateMachine ? [{
          name: 'Always operational (always-operatonal)',
          value: StateTypes.Operational,
        }] : []),
        {
          name: 'Can change at runtime between allowed or not allowed based on some conditions (allowed-not-allowed)',
          value: StateTypes.AllowedNotAllowed,
          short: 'Temporary allowed or not allowed',
        },
        {
          name: 'Can be either permanently operational or permanently non-operational based on some conditions (operational-non-operational)',
          value: 'operational-non-operational',
          short: 'Permanently operational or non-operational',
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
        message: 'Do you need to gather data from the server or other machines before the feature can be used?',
        choices: [
          {
            name: `Yes, I don't always know immediately if the feature is ${actionLabel} or not`,
            value: 'yes',
            short: 'Yes I do',
          },
          {
            name: `No, I have all the information I need to determine immediately if the feature is ${actionLabel} or not`,
            value: 'no',
            short: 'No I don\'t need to',
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
