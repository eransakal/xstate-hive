import {join} from 'path'
import {Configuration} from '../../configuration.js'
import {PromptsWizard} from '../../utils/prompts-wizard.js'
import {createMachinePrompts} from '../../transformers/create-machine-transformer/create-machine-prompts.js'
import {toDashCase} from '../../utils/formatters.js'
import {CreateMachineOptions, createMachineTransformer, validateCreateMachineOptions} from '../../transformers/create-machine-transformer/index.js'
import {getActiveCommand} from '../../active-command.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine-transformer/index.js'

export const createMachineHandler = async (options: { machineName?: string, machinePath?: string}): Promise<void> => {
  const {log} = getActiveCommand()
  const userPrompts =  await PromptsWizard.run<CreateMachineOptions>({
    prompts: [
      ...createMachinePrompts(options),
    ],
    validateAnswers: validateCreateMachineOptions,
  })

  const projectConfiguration = Configuration.get()
  const resolvedMachineName = toDashCase(userPrompts.machineName)

  if (projectConfiguration.hasMachine(resolvedMachineName)) {
    throw new Error('machine already exists')
  }

  const machineRelativePath = join(userPrompts.machinePath, `${resolvedMachineName}-machine`)
  const machinePath = join(projectConfiguration.root, machineRelativePath)

  log(`create machine '${resolvedMachineName}' in ${machinePath}`)
  await createMachineTransformer({
    machinePath: userPrompts.machinePath,
    machineName: userPrompts.machineName,
  })

  projectConfiguration.addMachineConfig(
    resolvedMachineName,
    {
      path: machineRelativePath,
    },
    false,
  )

  log('inject core state to machine')

  await injectStateTransformer({
    machineName: resolvedMachineName,
    actionType: 'root',
    newStateName: 'core',
  })

  // if (projectConfiguration.isPresetActive('kme')) {
  //   this.log('run kme extensions')
  //   await injectDiagnosticHook({machineName: resolvedMachineName})
  //   await createLoggerFile({machineName: resolvedMachineName})
  // }

  log('add new machine to configuration file')
  projectConfiguration.save()

  log(`machine '${resolvedMachineName}' created successfully`)
}
