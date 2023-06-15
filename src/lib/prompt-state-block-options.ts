import inquirer from 'inquirer'

export enum PromptStateTypeModes {
    CreateMachine,
    InjectState
}

export interface StateBlockOptions {
  withLoading: boolean,
  stateOffFinal: boolean,
  stateOnName: string,
  stateOffName: string,
}

export const promptStateBlockOptions = async (mode: PromptStateTypeModes): Promise<StateBlockOptions> => {
  const message = mode === PromptStateTypeModes.CreateMachine ?
    'Choose the machine availability:' :
    'Choose the state type that best fits the purpose:'

  const newStateType = (await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message,
      choices: [
        ...(mode === PromptStateTypeModes.CreateMachine ? [{
          name: 'Always operational',
          value: 'alwaysOn',
        }] : []),
        {
          name: 'Dynamically toggle between on and off statuses based on conditions',
          value: 'temporaryOnOff',
        },
        {
          name: 'Maintain a fixed state of either operational or non-operational statuses based on conditions',
          value: 'permanentOnOff',
        },
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

  const withLoading = (await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
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
        new inquirer.Separator(),
        {
          name: 'I\'m not sure what to choose, please assist me',
          value: 'help',
        },
      ],
    },
  ])).value

  return {
    stateOffFinal,
    withLoading,
    stateOnName: statusesNames.on,
    stateOffName: statusesNames.off,
  }
}
