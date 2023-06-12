import {Args, Command, Flags} from '@oclif/core'
import {Configuration} from '../../../configuration.js'
import {join} from 'path'
import {createMachine} from '../../../modifiers/create-machine.js'
import {injectMachineState} from '../../../modifiers/inject-machine-state.js'
import {injectDiagnosticHook} from '../../../modifiers/extensions/kme/inject-diagnostic-hook.js'
import {createLoggerFile} from '../../../modifiers/extensions/kme/create-logger-file.js'
import {setCommandLogger} from '../../../commands-utils/command-logger.js'
import {toDashCase, toLowerCamelCase} from '../../../utils.js'
import {StateTypes, isStatesType} from '../../../data.js'
import inquirer from 'inquirer'
import {PromptStateTypeModes, promptStateType} from '../../../commands-utils/prompt-state-type.js'

const formatMachineName = (name: string) => {
  const result = (name || '').trim()
  if (!result) {
    return ''
  }

  return  toLowerCamelCase(result).endsWith('Machine') ? toLowerCamelCase(result).slice(0, -7)  : toLowerCamelCase(result)
}

async function getUserInputs(prefilled:  Partial<{
  machineName: string,
  machinePath: string,
  coreStateType: StateTypes,
  isContainer: boolean,
}>): Promise<{
  machineName: string,
  machinePath: string,
  coreStateType?: StateTypes,
}> {
  const machineName = formatMachineName(
    prefilled.machineName || (await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: 'What is the name of the new machine',
      },
    ])).value)

  // TODO validate machine name, avoid duplications

  const machinePath = prefilled.machinePath || (await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: `Where do you want to store the machine files? Note that a new folder named '${machineName}-machine') will be created under the specified path.`,
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

  const coreStateType = prefilled.coreStateType || await promptStateType(PromptStateTypeModes.CreateMachine)

  return {
    machineName,
    machinePath,
    coreStateType,
  }
}

export default class Machine extends Command {
  static description = 'Create a new machine to manage a new feature'

  static examples = ['$ xstate-hive machine create ./src/machines quick-polls']

  static flags = {
    // coreState: Flags.string({
    //   description: 'inject core state of specified type',
    //   options: [StateTypes.AllowedNotAllowed, StateTypes.OperationalNotOperational],
    //   required: false,
    // }),
  }

  static args = {
    machinePath: Args.string({
      description: 'Destination path',
      required: false,
    }),
    machineName: Args.string({
      description: 'A machine name',
      required: false,
    }),
  }

  async run(): Promise<void> {
    setCommandLogger(this)
    const {args, flags} = await this.parse(Machine)

    try {
      if (flags.coreState && isStatesType(flags.coreState) === false) {
        this.error(`invalid core state type '${flags.coreState}'`, {exit: 1})
      }

      const userInputs = await getUserInputs({
        machineName: args.machineName,
        machinePath: args.machinePath,
        coreStateType: flags.coreState,
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

      if (userInputs.coreStateType) {
        this.log(`add core state of type '${userInputs.coreStateType}'`)

        await injectMachineState({
          newStateType: userInputs.coreStateType,
          machineName: resolvedMachineName,
          newStateName: 'core',
          newStateDirPath: '../machine-states/core',
          selectedStateInnerFileParents: [],
          selectedStateFilePath: `utils/create-${toDashCase(resolvedMachineName)}-machine.ts`,
        })
      }

      if (projectConfiguration.isPresetActive('kme')) {
        this.log(`add kme extensions to machine '${resolvedMachineName}'`)
        await injectDiagnosticHook({machineName: resolvedMachineName})
        await createLoggerFile({machineName: resolvedMachineName})
      }

      this.log('add new machine to configuration file')
      projectConfiguration.save()

      this.log(`machine '${resolvedMachineName}' created successfully`)
    } catch (error: any) {
      this.error(error instanceof Error ? error : error.message, {exit: 1})
    }
  }
}
