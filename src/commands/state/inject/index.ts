import {ux, Args, Command, Flags} from '@oclif/core'
import {Configuration} from '../../../configuration.js'
import {join} from 'path'
import {injectMachineState} from '../../../modifiers/inject-machine-state.js'
import {setCommandLogger} from '../../../command-logger.js'
import {toDashCase, toLowerCamelCase} from '../../../utils.js'
import {extractStatesOfMachine, MachineState} from '../../../utils/extract-states-of-machine.js'
import inquirer from 'inquirer'
import {StateTypes} from '../../../data.js'

const getMachineStates = async (machineName: string, statePath?: string) => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  return extractStatesOfMachine(resolvedStateFilePath)
}

const formatStateName = (stateName: string) => {
  const resolvedStateName = stateName.trim()
  if (!resolvedStateName) {
    throw new Error('state name cannot be empty')
  }

  return  toLowerCamelCase(resolvedStateName).endsWith('State') ? toLowerCamelCase(resolvedStateName).slice(0, -5)  : toLowerCamelCase(resolvedStateName)
}

async function getUserInputs({prefilled, machineStates} : {prefilled: unknown, machineStates: MachineState[] }) {
  let {stateType} = await inquirer.prompt([
    {
      type: 'list',
      name: 'stateType',
      message: 'What if the purpose of the state?',
      choices: [
        {
          name: 'Manage a feature that can be temporarily allowed or not allowed (allowed-not-allowed)',
          value: StateTypes.AllowedNotAllowed,
          short: 'Temporary allowed or not allowed',
        },
        {
          name: 'Manage a feature that can be permanently operational or not operational (operational-not-operational)',
          value: 'operational-not-operational',
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

  if (stateType === 'help') {
    // TODO
  }

  if (stateType === 'operational-not-operational' ||
  stateType === 'allowed-not-allowed') {
    const actionLabel = stateType === 'operational-not-operational' ? 'operational' : 'allowed'
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
      stateType += '-with-loading'
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
        name: 'Change a child state content',
        value: 'change',
        short: 'Change State',
      }],
    },
  ])

  const {selectedNode} = actionType === 'root' ?
    {selectedNode: null} :
    await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedNode',
        message: actionType === 'child' ?
          'Select the parent state to add a new state to' :
          'Select the state to change',
        choices: machineStates.map(state => state.id),
      },
    ])

  if (actionType === 'change') {
    // TODO verify that can change the content of the selected state
  }

  const {newStateName} = await inquirer.prompt([
    {
      type: 'input',
      name: 'newStateName',
      message: 'Enter the name of the new state',
    },
  ])

  return {
    actionType,
    selectedNode,
    newStateName: formatStateName(newStateName),
    stateType,
  }
}

export default class State extends Command {
  static description = 'Inject a state into the machine'

  static examples = ['$ xstate-hive state inject ']

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
      description: 'The path to the machine state to inject into (e.g. "core", "core.oper)',
      required: false,
    }),
  }

  static enableJsonFlag = true

  async run(): Promise<void> {
    setCommandLogger(this)
    const {args, flags} = await this.parse(State)

    try {
      const projectConfiguration = Configuration.get()

      const machineConfig = projectConfiguration.getMachine(args.machine)
      const machineStates = await getMachineStates(machineConfig.machineName)

      const userInputs = await getUserInputs({
        prefilled: {},
        machineStates,
      })

      this.log(`inject state '${args.targetStatePath}' in '${machineConfig.machineName}'`)

      ux.info(`inject state '${args.targetStatePath}' in '${machineConfig.machineName}'`)
      ux.action.start('injecting the state into the machine')

      switch (userInputs.actionType) {
      case 'root':
        await injectMachineState({
          stateType: userInputs.stateType,
          stateFilePath: `utils/create-${machineConfig.machineName}-machine.ts`,
          machineName: machineConfig.machineName,
          pathToParentStateInFile: '',
          stateName: userInputs.newStateName,
          stateImportPath: `../machine-states/${toDashCase(userInputs.newStateName)}-state`,
        })
        this.log(`injected new root state '${userInputs.newStateName}' in '${machineConfig.machineName}'`)
        break
      }

      ux.action.stop()
    } catch (error: any) {
      ux.action.stop()
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
