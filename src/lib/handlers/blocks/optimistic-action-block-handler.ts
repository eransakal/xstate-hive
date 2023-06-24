import {MachineConfig} from '../../configuration.js'
import {PromptsWizard} from '../../prompts/prompts-wizard.js'
import {createInjectStateToMachinePrompts} from '../../transformers/inject-state-to-machine-transformer/prompts.js'
import {InjectStateToMachineOptions, validateInjectStatusToMachineOptions} from '../../transformers/inject-state-to-machine-transformer/types.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine-transformer/index.js'
import * as fs from 'fs'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getStatePath} from '../../utils/paths.js'
import {OptimisticActionBlockTransformerOptions, validateOptimisticActionBlockTransformerOptions} from '../../transformers/generate-optimistic-action-block/types.js'
import {optimisticActionBlockTransformerPrompts} from '../../transformers/generate-optimistic-action-block/prompts.js'
import {generateOoptimisticActionBlockTransformer} from '../../transformers/generate-optimistic-action-block/index.js'

export const optimisticActionBlockHandler = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const optimisticActionBlockTransformerOptions =  await PromptsWizard.run<OptimisticActionBlockTransformerOptions>({
    machineConfig,
  }, {
    prompts: [
      ...(await optimisticActionBlockTransformerPrompts({
        machineConfig,
      })),
    ],
    validateAnswers: validateOptimisticActionBlockTransformerOptions,
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

  await generateOoptimisticActionBlockTransformer(optimisticActionBlockTransformerOptions)
}

