import {Args, Command} from '@oclif/core'
import {setActiveCommand} from '../../lib/active-command.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {generateBlockHandler} from '../../lib/handlers/blocks/generate-block-handler.js'

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

    const {args} = await this.parse(State)

    try {
      await generateBlockHandler({
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

