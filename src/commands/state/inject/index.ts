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
import {extractInfoFromFile} from '../../../utils/extract-info-from-file.js'

const getMachineStateGraph = async (machineName: string, statePath?: string) => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  extractInfoFromFile(resolvedStateFilePath)
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

    // get is focusing in a single feature or a container of sub-features
    // are the sub-features require a shared boot-up phase?
    // is this feature (or sub-features) can trigger toasts (notifications) to the user?

    const machineStateGraph = await getMachineStateGraph(args.machine)
    try {
      const projectConfiguration = Configuration.get()

      this.log(`inject state '${args.targetStatePath}' in '${args.machine}'`)

      const machineConfig = projectConfiguration.getMachine(args.machine)

      // this.log(`create machine '${args.machine}' in ${machinePath}`)
      // await createMachine({
      //   machinePath,
      //   machineName: args.machine,
      // })

      // projectConfiguration.addMachineConfig(
      //   args.machine,
      //   {
      //     path: machineRelativePath,
      //   },
      //   false,
      // )

      // if (flags.coreState) {
      //   this.log(`add core state '${flags.coreState}' to machine '${args.machine}'`)
      //   switch (flags.coreState) {
      //   case 'bootup-to-operational':
      //     await createBootupToOperationalState({
      //       machinePath,
      //       machineName: args.machine,
      //       parents: [],
      //       stateName: 'core',
      //     })
      //     break
      //   default:
      //     break
      //   }

      //   this.log('add core state to machine creator function')
      //   await addChildState({
      //     machineName: args.machine,
      //     parents: [],
      //     stateName: 'core',
      //     stateImportPath: '../machine-states/core',
      //   })
      // }

      // if (projectConfiguration.isPresetActive('kme')) {
      //   this.log(`add kme extensions to machine '${args.machine}'`)
      //   await injectDiagnosticHook({machineName: args.machine})
      //   await createLoggerFile({machineName: args.machine})
      // }

      // this.log('add new machine to configuration file')
      // projectConfiguration.save()

      // this.log(`machine '${args.machine}' created successfully`)
    } catch (error: any) {
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
