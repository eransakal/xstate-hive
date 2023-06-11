import {ux, Args, Command, Flags} from '@oclif/core'
import {Configuration, Machine} from '../../../configuration.js'
import {join} from 'path'
import {injectMachineState} from '../../../modifiers/inject-machine-state.js'
import {setCommandLogger} from '../../../command-logger.js'
import {toDashCase, toLowerCamelCase} from '../../../utils.js'
import {extractStatesOfMachine, MachineState} from '../../../utils/extract-states-of-machine.js'
import inquirer from 'inquirer'
import {StateTypes} from '../../../data.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'

const getMachineStates = async (machineName: string, statePath?: string): Promise<MachineState[]> => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  return extractStatesOfMachine(resolvedStateFilePath)
}

const formatStateName = (stateName: string) => {
  const resolvedStateName = (stateName || '').trim()
  if (!resolvedStateName) {
    return ''
  }

  return  toLowerCamelCase(resolvedStateName).endsWith('State') ? toLowerCamelCase(resolvedStateName).slice(0, -5)  : toLowerCamelCase(resolvedStateName)
}

async function getUserInputs({prefilled, machineStates} : {prefilled: unknown, machineStates: MachineState[] }) {
  let {newStateType} = await inquirer.prompt([
    {
      type: 'list',
      name: 'newStateType',
      message: 'What if the purpose of the state?',
      choices: [
        {
          name: 'Manage a feature that can be temporarily allowed or not allowed (allowed-not-allowed)',
          value: StateTypes.AllowedNotAllowed,
          short: 'Temporary allowed or not allowed',
        },
        {
          name: 'Manage a feature that can be permanently operational or not operational (operational-non-operational)',
          value: 'operational-non-operational',
          short: 'Permanently operational or not operational',
        },
        {
          name: 'Manage an asynchronously optimistic action performed by the user',
          value: 'async-optimistic-action',
          short: 'Asynchronously optimistic user action',
        },
        new inquirer.Separator(),
        {
          name: 'I\'m not sure what to choose, please assist me',
          value: 'help',
        },
      ],
    },
  ])

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

  const {actionType} = await inquirer.prompt([
    {
      type: 'list',
      name: 'actionType',
      message: 'What do you want to do?',
      choices: [{
        name: 'Add a new state to the machine root',
        value: 'root',
        short: 'Add Root State',
      },
      {
        name: 'Add a new state to a child state',
        value: 'child',
        short: 'Add Child State',
      },
      {
        name: 'Change an existing state type',
        value: 'change',
        short: 'Change Existing State Type',
      }],
    },
  ])

  const {selectedState} = actionType === 'root' ?
    {selectedState: null} :
    await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedState',
        message: actionType === 'child' ?
          'Select the parent state to add a new state to' :
          'Select the state to change',
        choices: machineStates.map(state => state.id),
      },
    ])

  const isNewStateNameRequired =  actionType !== 'change'

  if (actionType === 'change') {
    const selectedStateConfig = machineStates.find(state => state.id === selectedState)

    if (selectedStateConfig?.hasContent) {
      throw new Error('The selected state already has content, a support for that will be added in the future. For now you can remove the content manually and try again.')
    }
  }

  let newStateName = ''
  if (isNewStateNameRequired) {
    newStateName = (await inquirer.prompt([
      {
        type: 'input',
        name: 'newStateName',
        message: 'Enter the name of the new state',
      },
    ])).newStateName

    newStateName = formatStateName(newStateName)
  }

  return {
    actionType,
    selectedState,
    newStateName,
    newStateType,
  }
}

export default class State extends Command {
  static description = 'Inject a state into the machine'

  static examples = ['$ xstate-hive state inject [machine-name]']

  static flags = {
    state: Flags.string({
      description: 'add core state of specified type',
      options: [StateTypes.AllowedNotAllowed, StateTypes.OperationalNotOperational],
      required: false,
    }),
  }

  static args = {
    machine: Args.string({
      description: 'A machine name',
      required: true,
    }),
    targetStatePath: Args.string({
      description: 'The path to the machine state to inject into (e.g. "core", "core.operational")',
      required: false,
    }),
  }

  async run(): Promise<void> {
    setCommandLogger(this)

    const {args, flags} = await this.parse(State)
    let machineConfig: Machine | null = null
    let machineStates: MachineState[] | null = null

    try {
      const projectConfiguration = Configuration.get()
      try {
        machineConfig = projectConfiguration.getMachine(args.machine)
      } catch (error: any) {
        this.debug(error)
      }

      if (!machineConfig) {
        this.error(`machine '${args.machine}' not found, please verify that the machine is registered in '.xstate-hive.json' file.`, {exit: 1})
      }

      try {
        machineStates = await getMachineStates(machineConfig.machineName)
      } catch (error: any) {
        this.debug(error)
      }

      if (!machineStates) {
        this.error(`failed to extract the machine '${args.machine}' states, please verify that there are no compile issues and try again.`, {exit: 1})
      }

      const userInputs = await getUserInputs({
        prefilled: {},
        machineStates,
      })

      if (userInputs.actionType !== 'change' && userInputs.newStateName === '') {
        this.log('No state name was provided, aborting')
        return
      }

      ux.action.start('injecting the state into the machine')

      switch (userInputs.actionType) {
      case 'root':
        await injectMachineState({
          machineName: machineConfig.machineName,
          selectedStateFilePath: `utils/create-${machineConfig.machineName}-machine.ts`,
          selectedStateInnerFileParents: [],
          newStateName: userInputs.newStateName,
          newStateType: userInputs.newStateType,
          newStateDirPath: `../machine-states/${toDashCase(userInputs.newStateName)}-state`,
        })
        this.log(`injected new root state '${userInputs.newStateName}' in '${machineConfig.machineName}'`)
        break
      case 'child':
      {
        const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

        if (!stateConfig) {
          throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
        }

        await injectMachineState({
          newStateType: userInputs.newStateType,
          selectedStateFilePath: stateConfig.filePath,
          selectedStateInnerFileParents: stateConfig.innerFileParentStates,
          machineName: machineConfig.machineName,
          newStateName: userInputs.newStateName,
          newStateDirPath: `./${toDashCase(userInputs.newStateName)}-state`,
        })
        this.log(`injected state '${userInputs.newStateName}' of '${machineConfig.machineName}' into '${stateConfig.id}'`)
        break
      }

      case 'change':
      {
        const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

        if (!stateConfig) {
          throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
        }

        await injectMachineState({
          newStateType: userInputs.newStateType,
          selectedStateFilePath: stateConfig.filePath,
          selectedStateInnerFileParents: stateConfig.innerFileParentStates,
          machineName: machineConfig.machineName,
          newStateName: stateConfig.name,
          newStateDirPath: `./${toDashCase(stateConfig.name)}-state`,
        })
        this.log(`change type of state '${stateConfig.name}' into '${userInputs.newStateType}'`)
        break
      }
      }

      ux.action.stop()
    } catch (error: any) {
      ux.action.stop('failed')

      if (!(error instanceof CLIError)) {
        this.debug(error)
        this.error('Something wrong happened. Please remove partially created files and try again.', {exit: 1})
      } else {
        this.error(error.message, {exit: 1})
      }
    }
  }
}
