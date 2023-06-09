import {Args, Command, Flags} from '@oclif/core'
import {Configuration} from '../../../configuration.js'
import {join} from 'path'
import {createMachine} from '../../../modifiers/create-machine.js'
import {createBootupToOperationalState} from '../../../modifiers/create-bootup-to-operational-state.js'
import {addChildState} from '../../../modifiers/add-child-state.js'
import {injectDiagnosticHook} from '../../../modifiers/extensions/kme/inject-diagnostic-hook.js'
import {createLoggerFile} from '../../../modifiers/extensions/kme/create-logger-file.js'
import {setCommandLogger} from '../../../command-logger.js'
import {toDashCase} from '../../../utils.js'
import {extractStatesOfMachine, MachineState} from '../../../utils/extract-states-of-machine.js'
import inquirer from 'inquirer'

const getMachineStates = async (machineName: string, statePath?: string) => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  return extractStatesOfMachine(resolvedStateFilePath)
}

async function getUserInput({prefilled, machineStates} : {prefilled: unknown, machineStates: MachineState[] }) {
  const {stateType} = await inquirer.prompt([
    {
      type: 'list',
      name: 'stateType',
      message: 'What if the purpose of the state?',
      choices: [
        {
          name: 'Manage a feature that can be temporarily allowed or not allowed (allowed-not-allowed)',
          value: 'allowed-not-allowed',
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

  console.dir({
    actionType,
    selectedNode,
    newStateName,
    stateType,
  })
}

export default class State extends Command {
  static description = 'Inject a state into the machine'

  static examples = ['$ xstate-hive state inject ']

  static flags = {
    state: Flags.string({
      description: 'add core state of specified type',
      options: ['allowed-disallowed'],
      required: false,
      default: 'allowed-disallowed',
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

  async run(): Promise<void> {
    setCommandLogger(this)
    const {args, flags} = await this.parse(State)

    try {
      const projectConfiguration = Configuration.get()

      const machineStates = await getMachineStates(args.machine)

      // await getUserInput({
      //   prefilled: {},
      //   machineStates,
      // })

      this.log(`inject state '${args.targetStatePath}' in '${args.machine}'`)

      const machineConfig = projectConfiguration.getMachine(args.machine)

      // this.log(`create machine '${args.machine}' in ${machinePath}`)

      await addChildState({
        // stateFilePath: 'machine-states/core/operational-state.ts',
        stateFilePath: 'utils/create-eran-sakal-machine.ts',
        machineName: args.machine,
        pathToParentStateInFile: '',
        stateName: 'home',
        stateImportPath: './home',
      })

      await addChildState({
        // stateFilePath: 'machine-states/core/operational-state.ts',
        stateFilePath: 'utils/create-eran-sakal-machine.ts',
        machineName: args.machine,
        pathToParentStateInFile: 'allowed',
        stateName: 'home1',
        stateImportPath: './home1',
      })

      await addChildState({
        // stateFilePath: 'machine-states/core/operational-state.ts',
        stateFilePath: 'utils/create-eran-sakal-machine.ts',
        machineName: args.machine,
        pathToParentStateInFile: 'allowed.doSomething',
        stateName: 'home2',
        stateImportPath: './home2',
      })

      await addChildState({
        // stateFilePath: 'machine-states/core/operational-state.ts',
        stateFilePath: 'utils/create-eran-sakal-machine.ts',
        machineName: args.machine,
        pathToParentStateInFile: 'allowed.doSomething.not.exists',
        stateName: 'home3',
        stateImportPath: './home3',
      })

      // this.log(`machine '${args.machine}' created successfully`)
    } catch (error: any) {
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
