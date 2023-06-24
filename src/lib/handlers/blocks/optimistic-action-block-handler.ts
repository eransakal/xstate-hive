import {MachineConfig} from '../../configuration.js'
import {PromptsWizard} from '../../prompts/prompts-wizard.js'
import {createInjectStateToMachinePrompts} from '../../transformers/inject-state-to-machine/prompts.js'
import {InjectStateToMachineOptions, validateInjectStatusToMachineOptions} from '../../transformers/inject-state-to-machine/types.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine/index.js'
import * as fs from 'fs'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getStatePath} from '../../utils/paths.js'
import {OptimisticActionBlockOptions, validateOptimisticActionBlockOptions} from '../../transformers/generate-optimistic-action-block/types.js'
import {optimisticActionBlockPrompts} from '../../transformers/generate-optimistic-action-block/prompts.js'
import {generateOptimisticActionBlockTransformer} from '../../transformers/generate-optimistic-action-block/index.js'

export const optimisticActionBlockHandler = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const optimisticActionBlockTransformerOptions =  await PromptsWizard.run<OptimisticActionBlockOptions>({
    machineConfig,
  }, {
    prompts: [
      ...(await optimisticActionBlockPrompts({
        machineConfig,
      })),
    ],
    validateAnswers: validateOptimisticActionBlockOptions,
  })

  const injectStateToMachineOptions = await PromptsWizard.run<InjectStateToMachineOptions>({
    parentState: optimisticActionBlockTransformerOptions.parentState,
    stateName: optimisticActionBlockTransformerOptions.stateName,
  }, {
    prompts: [
      ...(await createInjectStateToMachinePrompts({machineConfig})),
    ],
    validateAnswers: validateInjectStatusToMachineOptions,
  })

  const newStatePath = getStatePath(optimisticActionBlockTransformerOptions.parentState, optimisticActionBlockTransformerOptions.stateName)
  if (fs.existsSync(newStatePath)) {
    throw new CLIError(`State file '${newStatePath}' already exists (do you have a sibilant state with the same name?)`)
  }

  await injectStateTransformer(injectStateToMachineOptions)

  await generateOptimisticActionBlockTransformer(optimisticActionBlockTransformerOptions)
}

