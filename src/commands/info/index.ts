import {Command, Flags} from '@oclif/core'
import {Configuration} from '../../lib/configuration.js'

export default class Init extends Command {
  static description = '';

  static examples = [
    '$ xstate-hive info',
  ];

  static flags = {};

  static args = {};

  async run(): Promise<void> {
    const projectConfiguration = Configuration.get()
    this.logJson({
      env: process.env.NODE_ENV,
      libraries: projectConfiguration.getCoreLibrariesVersions(),
    })
  }
}
