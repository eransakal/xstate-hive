import {Args, Command} from '@oclif/core'
import {setActiveCommand} from '../../lib/active-command.js'
import {machineHandler} from '../../lib/handlers/machine/machine-handler.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'

export default class Machine extends Command {
  static description = 'Create a new machine to manage a new feature'

  static examples = ['$ xstate-hive machine quick-polls ./src/machines',
    '$ xstate-hive machine quick-polls',
    '$ xstate-hive machine']

  static flags = {}

  static args = {
    machineName: Args.string({
      description: 'A machine name',
      required: false,
    }),
    machinePath: Args.string({
      description: 'Destination path',
      required: false,
    }),
  }

  async run(): Promise<void> {
    setActiveCommand(this, this.debug)
    const {args} = await this.parse(Machine)

    try {
      machineHandler({
        machineName: args.machineName,
        machinePath: args.machinePath,
      })
    } catch (error: any) {
      if (error instanceof CLIError) {
        this.error(error.message, {exit: 1})
      } else {
        this.debug(error)
        this.error('Something wrong happened. Please remove partially created files and try again.', {exit: 1})
      }
    }
  }
}

