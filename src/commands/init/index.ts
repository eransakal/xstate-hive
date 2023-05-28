import {Command, Flags} from '@oclif/core'
import {Configuration} from '../../configuration.js'

export default class Init extends Command {
  static description = 'Create a configuration file for xstate-hive on the root of your project';

  static examples = [
    '$ xstate-hive init',
  ];

  static flags = {
    kme: Flags.boolean({
      description: 'is a K(altura)ME project',
      hidden: true,
      required: false,
      default: false,
      allowNo: true,
    }),
  };

  static args = {};

  async run(): Promise<void> {
    const {flags} = await this.parse(Init)

    try {
      const projectConfiguration = Configuration.create({
        isKME: flags.kme ? true : undefined,
      })

      this.log(`A configuration file was created at ${projectConfiguration.root}`)
    } catch (error: any) {
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
