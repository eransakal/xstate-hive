import {Args, Command, Flags} from '@oclif/core'
import {Configuration} from '../../../configuration.js'
import {join} from 'path'
import {createMachine} from '../../../modifiers/create-machine.js'
import {injectMachineState} from '../../../modifiers/inject-machine-state.js'
import {injectDiagnosticHook} from '../../../modifiers/extensions/kme/inject-diagnostic-hook.js'
import {createLoggerFile} from '../../../modifiers/extensions/kme/create-logger-file.js'
import {setCommandLogger} from '../../../command-logger.js'
import {toDashCase} from '../../../utils.js'
import {StateTypes} from '../../../data.js'

export default class Machine extends Command {
  static description = 'Create a new machine to manage a new feature'

  static examples = ['$ xstate-hive machine create ./src/machines quick-polls']

  static flags = {
    coreState: Flags.string({
      description: 'inject core state of specified type',
      options: [StateTypes.AllowedNotAllowed, StateTypes.OperationalNotOperational],
      required: false,
      default: StateTypes.OperationalNotOperational,
    }),
    withLoading: Flags.boolean({
      description: 'decide if the core state should include a loading state',
      required: false,
      default: true,
    }),
  }

  static args = {
    dest: Args.string({
      description: 'Destination path',
      required: true,
    }),
    machine: Args.string({
      description: 'A machine name',
      required: true,
    }),
  }

  async run(): Promise<void> {
    setCommandLogger(this)
    const {args, flags} = await this.parse(Machine)

    // get is focusing in a single feature or a container of sub-features
    // are the sub-features require a shared boot-up phase?
    // is this feature (or sub-features) can trigger toasts (notifications) to the user?

    try {
      const projectConfiguration = Configuration.get()
      const resolvedMachineName = toDashCase(args.machine)
    
      if (projectConfiguration.hasMachine(resolvedMachineName)) {
        throw new Error('machine already exists')
      }

      const machineRelativePath = join(args.dest, `${resolvedMachineName}-machine`)
      const machinePath = join(projectConfiguration.root, machineRelativePath)
      this.log(`create machine '${resolvedMachineName}' in ${machinePath}`)
      await createMachine({
        machinePath,
        machineName: resolvedMachineName,
      })

      projectConfiguration.addMachineConfig(
        resolvedMachineName,
        {
          path: machineRelativePath,
        },
        false,
      )

      if (flags.coreState) {
        const resolvedCoreState = flags.withLoading ? `${flags.coreState}-with-loading` : flags.coreState

        this.log(`add core state of type '${resolvedCoreState}'${flags.withLoading ? ' (with loading state)' : ''} to machine '${resolvedMachineName}'`)

        await injectMachineState({
          newStateType: resolvedCoreState as StateTypes,
          machineName: resolvedMachineName,
          newStateName: 'core',
          newStateDirPath: '../machine-states/core',
          selectedStateInnerFileParents: [],
          selectedStateFilePath: `utils/create-${toDashCase(resolvedMachineName)}-machine.ts`,
        })
      }

      if (projectConfiguration.isPresetActive('kme')) {
        this.log(`add kme extensions to machine '${resolvedMachineName}'`)
        await injectDiagnosticHook({machineName: resolvedMachineName})
        await createLoggerFile({machineName: resolvedMachineName})
      }

      this.log('add new machine to configuration file')
      projectConfiguration.save()

      this.log(`machine '${resolvedMachineName}' created successfully`)
    } catch (error: any) {
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
