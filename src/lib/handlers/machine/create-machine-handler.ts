import {join} from 'path'
import {Configuration} from '../../configuration.js'
import {PromptsWizard} from '../../utils/prompts-wizard.js'
import {createMachinePrompts} from '../../transformers/create-machine-transformer/create-machine-prompts.js'
import {formatMachineName, toDashCase} from '../../utils/formatters.js'
import {CreateMachineOptions, createMachineTransformer, validateCreateMachineOptions} from '../../transformers/create-machine-transformer/index.js'
import {getActiveCommand} from '../../active-command.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine-transformer/index.js'
import {GenerateStatusBlockOptions, generateStatusBlockTransformer, validateGenerateStatusBlockOptions} from '../../transformers/generate-status-block/index.js'
import {generateStatusBlockPrompts} from '../../transformers/generate-status-block/generate-status-block-prompts.js'
import {promptListWithHelp} from '../../utils/prompts.js'

export const createMachineHandler = async (options: { machineName?: string, machinePath?: string}): Promise<void> => {
  const {log} = getActiveCommand()
  const createMachineOptions =  await PromptsWizard.run<CreateMachineOptions>({
    machineName: formatMachineName(options.machineName),
    machinePath: options.machinePath,
  }, {
    prompts: [
      ...createMachinePrompts(),
    ],
    validateAnswers: validateCreateMachineOptions,
  })

  const machinePurpose = await promptListWithHelp(
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

  const newStateName = machinePurpose === 'single' ? 'core' : ''
  const generateStatusBlockOptions =  await PromptsWizard.run<GenerateStatusBlockOptions>({
    machineName: createMachineOptions.machineName,
    newStateName,
    parentStateFilePath: `utils/create-${options.machineName}-machine.ts`,
    newStateDirPath: `../machine-states/${newStateName}-state`,
  }, {
    prompts: [
      ...generateStatusBlockPrompts({alwaysOnAvailable: true, defaultValue: 'alwaysOn', customLabel: 'machine'}),
    ],
    validateAnswers: validateGenerateStatusBlockOptions,
  })

  const projectConfiguration = Configuration.get()
  const resolvedMachineName = toDashCase(createMachineOptions.machineName)

  if (projectConfiguration.hasMachine(resolvedMachineName)) {
    throw new Error('machine already exists')
  }

  await createMachineTransformer(createMachineOptions)

  const machineRelativePath = join(createMachineOptions.machinePath, `${resolvedMachineName}-machine`)
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
    newStateName: generateStatusBlockOptions.newStateName,
  })

  log('generate core state')
  await generateStatusBlockTransformer(generateStatusBlockOptions)

  // if (projectConfiguration.isPresetActive('kme')) {
  //   this.log('run kme extensions')
  //   await injectDiagnosticHook({machineName: resolvedMachineName})
  //   await createLoggerFile({machineName: resolvedMachineName})
  // }

  log('add new machine to configuration file')
  projectConfiguration.save()

  log(`machine '${resolvedMachineName}' created successfully`)
}
