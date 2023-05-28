import {Args, Command, Flags} from '@oclif/core'
import {Configuration} from '../../../configuration.js'
import {join} from 'path'
import {createMachine} from '../../../modifiers/create-machine.js'
import {createBootupToOperatingState} from '../../../modifiers/create-bootup-to-operating-state.js'
import {addChildState} from '../../../modifiers/add-child-state.js'

export default class Machine extends Command {
  static description = 'Create a new machine to manage a new feature';

  static examples = [
    '$ xstate-hive machine create ./src/machines quick-polls',
  ];

  static flags = {
    coreState: Flags.string({
      description: 'add core state of specified type',
      options: ['bootup-to-operating'],
      required: false,
      default: 'bootup-to-operating',
    }),
  };

  static args = {
    dest: Args.string({
      description: 'Destination path',
      required: true,
    }),
    machine: Args.string({
      description: 'A machine name',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Machine)

    try {
      const projectConfiguration = Configuration.get()

      if (projectConfiguration.hasMachine(args.machine)) {
        throw new Error('machine already exists')
      }

      const machineRelativePath = join(args.dest, `${args.machine}-machine`)
      const machinePath = join(projectConfiguration.root, machineRelativePath)
      this.log(
        `create machine '${args.machine}' in ${machinePath}`,
      )

      await createMachine({
        machinePath,
        machineName: args.machine,
      })

      projectConfiguration.addMachineConfig(args.machine, {
        path: machineRelativePath,
      }, false)

      if (flags.coreState) {
        switch (flags.coreState) {
        case 'bootup-to-operating':
          await createBootupToOperatingState({
            machinePath,
            machineName: args.machine,
            parents: [],
            stateName: 'core',
          })
          break
        }
      }

      await addChildState({
        machineName: args.machine,
        parents: [],
        stateName: 'core',
        stateImportPath: '../machine-states/core',
      })

      projectConfiguration.save()

      this.log(`machine '${args.machine}' created successfully`)
    } catch (error: any) {
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
