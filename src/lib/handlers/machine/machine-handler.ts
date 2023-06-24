import {join} from 'path'
import {Configuration} from '../../configuration.js'
import {PromptsWizard} from '../../prompts/prompts-wizard.js'
import {createMachinePrompts} from '../../transformers/create-machine-transformer/prompts.js'
import {formatMachineName, toDashCase} from '../../utils/formatters.js'
import {createMachineTransformer} from '../../transformers/create-machine-transformer/index.js'
import {getActiveCommand} from '../../active-command.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine-transformer/index.js'
import {generateStatusBlockTransformer} from '../../transformers/generate-status-block/index.js'
import {generateStatusBlockPrompts} from '../../transformers/generate-status-block/prompts.js'
import {promptListWithHelp} from '../../prompts/prompts.js'
import {injectDiagnosticHook} from '../../plugins/kme/inject-diagnostic-hook.js'
import {createLoggerFile} from '../../plugins/kme/create-logger-file.js'
import {CreateMachineOptions, validateCreateMachineOptions} from '../../transformers/create-machine-transformer/types.js'
import {GenerateStatusBlockOptions, validateGenerateStatusBlockOptions} from '../../transformers/generate-status-block/types.js'
import {createRootMachineState} from '../../utils/get-machine-states.js'

export const machineHandler = async (options: { machineName?: string, machinePath?: string}): Promise<void> => {
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

  const projectConfiguration = Configuration.get()
  const resolvedMachineName = toDashCase(createMachineOptions.machineName)

  if (projectConfiguration.hasMachine(resolvedMachineName)) {
    throw new Error('machine already exists')
  }

  const machineRelativePath = join(createMachineOptions.machinePath, `${resolvedMachineName}-machine`)
  const machineConfig = projectConfiguration.addMachineConfig(
    resolvedMachineName,
    {
      path: machineRelativePath,
    },
    false,
  )

  const initialStateName = machinePurpose === 'single' ? 'core' : ''
  const generateStatusBlockOptions =  await PromptsWizard.run<GenerateStatusBlockOptions>({
    machineConfig,
    stateName: initialStateName,
    parentState: createRootMachineState(resolvedMachineName, machineConfig.getAbsolutePath()),
  }, {
    prompts: [
      ...(await generateStatusBlockPrompts({
        alwaysOnAvailable: true,
        defaultValue: 'alwaysOn',
        customLabel: 'machine',
        machineConfig,
      })),
    ],
    validateAnswers: validateGenerateStatusBlockOptions,
  })

  await createMachineTransformer(createMachineOptions)

  log('inject core state to machine')

  await injectStateTransformer({

    parentState: createRootMachineState(resolvedMachineName, machineConfig.getAbsolutePath()),
    stateName: generateStatusBlockOptions.stateName,
  })

  log('generate core state')
  await generateStatusBlockTransformer(generateStatusBlockOptions)

  if (projectConfiguration.isPresetActive('kme')) {
    log('run kme plugins')
    await injectDiagnosticHook({machineName: resolvedMachineName})
    await createLoggerFile({machineName: resolvedMachineName})
  }

  log('add new machine to configuration file')
  projectConfiguration.save()

  log(`machine '${resolvedMachineName}' created successfully`)
}
