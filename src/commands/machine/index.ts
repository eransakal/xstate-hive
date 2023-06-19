import {Args, Command} from '@oclif/core'
import {setActiveCommand} from '../../lib/active-command.js'
import {createMachineHandler} from '../../lib/handlers/machine/create-machine-handler.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'

// {
//   propName: 'machineType',
//   validate: data =>  typeof data.machineType === 'string' || 'Machine type name must be a string',
//   run: async () => promptListWithHelp(
//     {
//       defaultValue: 'single',
//       message: 'Choose the appropriate statement for this machine:', choices: [
//         {
//           name: 'The primary focus of this machine revolves around a single feature (recommended)',
//           value: 'single',
//         },
//         {
//           name: 'This machine serve as a container for independent sub-features',
//           value: 'container',
//         },
//       ], helpLink: 'https://sakalim.com/projects/react-architecture/application-state-with-xstate-4-guides-machines#machine-types',
//     }),
// },
// async function getUserInputs(prefilled:  Partial<{
//   createMachinePrompts: string,
//   machinePath: string,
//   isContainer: boolean,
// }>): Promise<CreateMachinePrompts> {
//   // const projectConfiguration = Configuration.get()

//   // const machineStates = await getMachineStates(machineName)

//   const userAnswers =
//   )
//   if (projectConfiguration.hasMachine(machineName)) {
//     throw new CLIError(`machine '${machineName}' already exists`)
//   }

//   const stateName = {
//     propName: 'stateName',
//     validate: data =>  typeof data.machineType === 'string' || 'Machine type name must be a string',
//     run: async data => data.machineType === 'single' ? 'core' : (await inquirer.prompt([
//       {
//         type: 'input',
//         name: 'value',
//         message: 'Enter the name of first feature you plan to develop:',
//       },
//     ])).value,
//   },
//   const stateOptions = await promptStateBlockOptions({
//     customLabel: machineType === 'container' ? '' : 'machine',
//     alwaysOnAvailable: true,
//   })

//   return {
//     machineName,
//     machineType,
//     stateName,
//     machinePath,
//     stateOptions,

//   }
// }

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
      createMachineHandler({
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

