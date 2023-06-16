import {Args, Command} from '@oclif/core'
import {Configuration} from '../../lib/configuration.js'
import {join} from 'path'
import {createMachine} from '../../lib/modifiers/create-machine.js'
import {injectDiagnosticHook} from '../../lib/modifiers/extensions/kme/inject-diagnostic-hook.js'
import {createLoggerFile} from '../../lib/modifiers/extensions/kme/create-logger-file.js'
import {setActiveCommand} from '../../lib/active-command.js'
import {formatMachineName, toDashCase} from '../../lib/utils.js'
import inquirer from 'inquirer'
import {StateBlockOptions, promptStateBlockOptions} from '../../lib/prompt-state-block-options.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {injectStateBlock} from '../../lib/modifiers/inject-state-block.js'
import {promptListWithHelp} from '../../lib/utils/prompts.js'

async function getUserInputs(prefilled:  Partial<{
  machineName: string,
  machinePath: string,
  isContainer: boolean,
}>): Promise<{
  machineName: string,
  machinePath: string,
  machineType: string,
  stateName: string,
  stateOptions: StateBlockOptions
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

  const machineType = await promptListWithHelp(
    {
      defaultValue: 'single',
      message: 'Choose the appropriate statement for this machine:', choices: [
        {
          name: 'The primary focus of this machine revolves around a single feature (recommended)',
          value: 'single',
        },
        {
          name: 'This machine serve as a container for independent sub-features',
          value: 'container',
        },
      ], helpLink: 'https://sakalim.com/projects/react-architecture/application-state-with-xstate-4-guides-machines#machine-types',
    })

  const stateName = machineType === 'single' ? 'core' : (await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: 'Enter the name of first feature you plan to develop:',
    },
  ])).value
  const stateOptions = await promptStateBlockOptions({
    customLabel: machineType === 'container' ? '' : 'machine',
    alwaysOnAvailable: true,
  })

  return {
    machineName,
    machineType,
    stateName,
    machinePath,
    stateOptions,

  }
}

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
        newStateOptions: userInputs.stateOptions,
        machineName: resolvedMachineName,
        newStateName: 'core',
        newStateDirPath: '../machine-states/core',
        selectedStateParentsInFile: [],
        selectedStateFilePath: `utils/create-${toDashCase(resolvedMachineName)}-machine.ts`,
      })

      if (projectConfiguration.isPresetActive('kme')) {
        this.log('run kme extensions')
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

