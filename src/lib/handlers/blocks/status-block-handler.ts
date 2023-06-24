import {MachineConfig} from '../../configuration.js'
import {PromptsWizard} from '../../prompts/prompts-wizard.js'
import {createInjectStateToMachinePrompts} from '../../transformers/inject-state-to-machine/prompts.js'
import {InjectStateToMachineOptions, validateInjectStatusToMachineOptions} from '../../transformers/inject-state-to-machine/types.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine/index.js'
import {GenerateStatusBlockOptions, validateGenerateStatusBlockOptions} from '../../transformers/generate-status-block/types.js'
import {generateStatusBlockPrompts} from '../../transformers/generate-status-block/prompts.js'
import * as fs from 'fs'
import {generateStatusBlockTransformer} from '../../transformers/generate-status-block/index.js'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getStatePath} from '../../utils/paths.js'

export const statusBlockHandler = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const injectStateToMachineOptions = await PromptsWizard.run<InjectStateToMachineOptions>({}, {
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

  const newStatePath = getStatePath(generateStatusBlockOptions.parentState, generateStatusBlockOptions.stateName)
  if (fs.existsSync(newStatePath)) {
    throw new CLIError(`State file '${newStatePath}' already exists (do you have a sibilant state with the same name?)`)
  }

  // ux.action.start(`inject '${injectStateToMachineOptions.stateName || ''}' state into '${injectStateToMachineOptions.parentState.id || injectStateToMachineOptions.parentState.name}' state declaration`)
  await injectStateTransformer(injectStateToMachineOptions)
  // ux.action.stop()

  // ux.action.start(`generate new state files '${}`)
  await generateStatusBlockTransformer(generateStatusBlockOptions)
  // ux.action.stop()
}

