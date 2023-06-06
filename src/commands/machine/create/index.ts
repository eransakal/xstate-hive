import {Args, Command, Flags} from '@oclif/core'
import {Configuration} from '../../../configuration.js'
import {join} from 'path'
import {createMachine} from '../../../modifiers/create-machine.js'
import {createBootupToOperationalState} from '../../../modifiers/create-bootup-to-operational-state.js'
import {addChildState} from '../../../modifiers/add-child-state.js'
import {injectDiagnosticHook} from '../../../modifiers/extensions/kme/inject-diagnostic-hook.js'
import {createLoggerFile} from '../../../modifiers/extensions/kme/create-logger-file.js'
import {setCommandLogger} from '../../../command-logger.js'

export default class Machine extends Command {
  static description = 'Create a new machine to manage a new feature'

  static examples = ['$ xstate-hive machine create ./src/machines quick-polls']

  static flags = {
    coreState: Flags.string({
      description: 'add core state of specified type',
      options: ['bootup-to-operational'],
      required: false,
      default: 'bootup-to-operational',
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

      this.log(`create machine '${args.machine}' in ${args.dest} (flags: ${JSON.stringify(flags)})`)

      if (projectConfiguration.hasMachine(args.machine)) {
        throw new Error('machine already exists')
      }

      const machineRelativePath = join(args.dest, `${args.machine}-machine`)
      const machinePath = join(projectConfiguration.root, machineRelativePath)
      this.log(`create machine '${args.machine}' in ${machinePath}`)
      await createMachine({
        machinePath,
        machineName: args.machine,
      })

      projectConfiguration.addMachineConfig(
        args.machine,
        {
          path: machineRelativePath,
        },
        false,
      )

      if (flags.coreState) {
        this.log(`add core state '${flags.coreState}' to machine '${args.machine}'`)
        switch (flags.coreState) {
        case 'bootup-to-operational':
          await createBootupToOperationalState({
            machinePath,
            machineName: args.machine,
            parents: [],
            stateName: 'core',
          })
          break
        default:
          break
        }

        this.log('add core state to machine creator function')
        await addChildState({
          machineName: args.machine,
          parents: [],
          stateName: 'core',
          stateImportPath: '../machine-states/core',
        })
      }

      if (projectConfiguration.isPresetActive('kme')) {
        this.log(`add kme extensions to machine '${args.machine}'`)
        await injectDiagnosticHook({machineName: args.machine})
        await createLoggerFile({machineName: args.machine})
      }

      this.log('add new machine to configuration file')
      projectConfiguration.save()

      this.log(`machine '${args.machine}' created successfully`)
    } catch (error: any) {
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
