import {MachineConfig} from '../../configuration.js'
import {PromptsWizard} from '../../utils/prompts-wizard.js'
import {createInjectStateToMachinePrompts} from '../../transformers/inject-state-to-machine-transformer/prompts.js'
import {InjectStateToMachineOptions, validateInjectStatusToMachineOptions} from '../../transformers/inject-state-to-machine-transformer/types.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine-transformer/index.js'
import {getActiveCommand} from '../../active-command.js'
import {GenerateStatusBlockOptions, validateGenerateStatusBlockOptions} from '../../transformers/generate-status-block/types.js'
import {generateStatusBlockPrompts} from '../../transformers/generate-status-block/prompts.js'
import {isStringWithValue} from '../../utils/validators.js'
import {ux} from '@oclif/core'
import {generateStatusBlockTransformer} from '../../transformers/generate-status-block/index.js'

export const addStatusBlockHandler = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const {log} = getActiveCommand()
  const injectStateToMachineOptions = await PromptsWizard.run<InjectStateToMachineOptions>({
    machineName: machineConfig.machineName,
  }, {
    prompts: [
      ...(await createInjectStateToMachinePrompts({machineConfig})),
    ],
    validateAnswers: validateInjectStatusToMachineOptions,
  })

  const generateStatusBlockOptions =  await PromptsWizard.run<GenerateStatusBlockOptions>({
    machineConfig,
    stateName: injectStateToMachineOptions.stateName,
    parentState: injectStateToMachineOptions.parentState,
  }, {
    prompts: [
      ...(await generateStatusBlockPrompts({
        alwaysOnAvailable: false,
        machineConfig,
      })),
    ],
    validateAnswers: validateGenerateStatusBlockOptions,
  })
  ux.action.start(`inject '${injectStateToMachineOptions.stateName || ''}' state into '${injectStateToMachineOptions.parentState.id || injectStateToMachineOptions.parentState.name}' state declaration`)
  await injectStateTransformer(injectStateToMachineOptions)
  ux.action.stop()
  ux.action.start('generate new state files')
  await generateStatusBlockTransformer(generateStatusBlockOptions)
  ux.action.stop()
}

