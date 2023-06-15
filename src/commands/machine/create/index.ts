import {Args, Command} from '@oclif/core'
import {Configuration} from '../../../configuration.js'
import {join} from 'path'
import {createMachine} from '../../../modifiers/create-machine.js'
import {injectDiagnosticHook} from '../../../modifiers/extensions/kme/inject-diagnostic-hook.js'
import {createLoggerFile} from '../../../modifiers/extensions/kme/create-logger-file.js'
import {setActiveCommand} from '../../../active-command.js'
import {formatMachineName, toDashCase} from '../../../utils.js'
import inquirer from 'inquirer'
import {PromptStateTypeModes, StateBlockOptions, promptStateBlockOptions} from '../../../commands-src/prompt-state-block-options.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {injectStateBlock} from '../../../modifiers/inject-state-block.js'

async function getUserInputs(prefilled:  Partial<{
  machineName: string,
  machinePath: string,
  isContainer: boolean,
}>): Promise<{
  machineName: string,
  machinePath: string,
  coreStateOptions: StateBlockOptions
}> {
  const projectConfiguration = Configuration.get()
  const machineName = formatMachineName(
    prefilled.machineName || (await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: 'Enter the name of the new machine:',
      },
    ])).value)

  if (!machineName) {
    throw new CLIError('machine name is required')
  }

  if (projectConfiguration.hasMachine(machineName)) {
    throw new CLIError(`machine '${machineName}' already exists`)
  }

  const machinePath = prefilled.machinePath || (await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: `Enter the directory path to create the '${machineName}-machine' folder in:`,
    },
  ])).value

  // let machineType = (await inquirer.prompt([
  //   {
  //     type: 'list',
  //     name: 'value',
  //     message: `Is this machine focus on a single feature or it is a container of independant sub-features?`,
  //     choices: [
  //       {
  //         name: 'This machine focus on a single feature',
  //         value: "single"
  //       },
  //       {
  //         name: 'This machine is a container of sub-features',
  //         value: "container"
  //       },
  //       new inquirer.Separator(),
  //       {
  //         name: 'I\'m not sure what to choose, please assist me',
  //         value: 'help',
  //       },
  //     ],
  //   },
  // ])).value

  // if (machineType === 'help') {
  //   // TODO
  // }

  // if (machineType === 'container') {

  // }

  // TODO if container ask for the first feature name and use it instead of core
  // TODO if container check if the sub-features require a shared boot-up phase
  // TODO create notifications if needed

  const coreStateOptions = await promptStateBlockOptions(PromptStateTypeModes.CreateMachine)

  return {
    machineName,
    machinePath,
    coreStateOptions,

  }
}

export default class Machine extends Command {
  static description = 'Create a new machine to manage a new feature'

  static examples = ['$ xstate-hive machine create quick-polls ./src/machines',
    '$ xstate-hive machine create quick-polls',
    '$ xstate-hive machine create']

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
    const {args, flags} = await this.parse(Machine)

    try {
      const userInputs = await getUserInputs({
        machineName: args.machineName,
        machinePath: args.machinePath,
      })

      const projectConfiguration = Configuration.get()
      const resolvedMachineName = toDashCase(userInputs.machineName)

      if (projectConfiguration.hasMachine(resolvedMachineName)) {
        throw new Error('machine already exists')
      }

      const machineRelativePath = join(userInputs.machinePath, `${resolvedMachineName}-machine`)
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

      this.log('add core state')

      await injectStateBlock({
        newStateOptions: userInputs.coreStateOptions,
        machineName: resolvedMachineName,
        newStateName: 'core',
        newStateDirPath: '../machine-states/core',
        selectedStateParentsInFile: [],
        selectedStateFilePath: `utils/create-${toDashCase(resolvedMachineName)}-machine.ts`,
      })

      if (projectConfiguration.isPresetActive('kme')) {
        this.log(`add kme extensions to machine '${resolvedMachineName}'`)
        await injectDiagnosticHook({machineName: resolvedMachineName})
        await createLoggerFile({machineName: resolvedMachineName})
      }

      this.log('add new machine to configuration file')
      projectConfiguration.save()

      this.log(`machine '${resolvedMachineName}' created successfully`)
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

