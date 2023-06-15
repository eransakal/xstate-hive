import {Args, Command, Flags} from '@oclif/core'
import {setActiveCommand} from '../../active-command.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {generateBlock} from '../../commands-src/blocks/generate-block.js'

export default class State extends Command {
  static description = 'Inject a block of funcionality into the machine'

  static examples = ['$ xstate-hive block inject [machine-name]']

  static flags = {}

  static args = {
    machineName: Args.string({
      description: 'A machine name',
      required: false,
    }),
    targetStatePath: Args.string({
      description: 'The path to the machine state to inject into (e.g. "core", "core.operational")',
      required: false,
    }),
  }

  async run(): Promise<void> {
    setActiveCommand(this, this.debug)

    const {args, flags} = await this.parse(State)

    try {
      await generateBlock({
        machineName: args.machineName,
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

