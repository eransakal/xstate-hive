import {MachineConfig} from '../../configuration.js'
import {PromptsWizard} from '../../prompts/prompts-wizard.js'
import {createInjectStateToMachinePrompts} from '../../transformers/inject-state-to-machine/prompts.js'
import {InjectStateToMachineOptions, validateInjectStatusToMachineOptions} from '../../transformers/inject-state-to-machine/types.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine/index.js'
import * as fs from 'fs'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getStatePath} from '../../utils/paths.js'
import {ServerActionBlockOptions, validateServerActionBlockOptions} from '../../transformers/generate-server-action-block/types.js'
import {serverActionBlockPrompts} from '../../transformers/generate-server-action-block/prompts.js'
import {generateServerActionBlockTransformer} from '../../transformers/generate-server-action-block/index.js'

export const serverActionBlockHandler = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const serverActionBlockTransformerOptions =  await PromptsWizard.run<ServerActionBlockOptions>({
    machineConfig,
  }, {
    prompts: [
      ...(await serverActionBlockPrompts({
        machineConfig,
      })),
    ],
    validateAnswers: validateServerActionBlockOptions,
  })

  const injectStateToMachineOptions = await PromptsWizard.run<InjectStateToMachineOptions>({
    parentState: serverActionBlockTransformerOptions.parentState,
    stateName: serverActionBlockTransformerOptions.stateName,
    forceTypeParallel: true,
  }, {
    prompts: [
      ...(await createInjectStateToMachinePrompts({machineConfig})),
    ],
    validateAnswers: validateInjectStatusToMachineOptions,
  })

  const newStatePath = getStatePath(serverActionBlockTransformerOptions.parentState, serverActionBlockTransformerOptions.stateName)
  if (fs.existsSync(newStatePath)) {
    throw new CLIError(`State file '${newStatePath}' already exists (do you have a sibilant state with the same name?)`)
  }

  await injectStateTransformer(injectStateToMachineOptions)

  await generateServerActionBlockTransformer(serverActionBlockTransformerOptions)
}

