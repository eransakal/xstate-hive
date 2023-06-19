import {MachineConfig} from '../../configuration.js'
import {InjectStateToMachineOptions, injectStateTransformer, validateInjectStatusToMachineOptions} from '../../transformers/inject-state-to-machine-transformer/index.js'
import {PromptsWizard} from '../../utils/prompts-wizard.js'
import {createInjectStateToMachinePrompts} from '../../transformers/inject-state-to-machine-transformer/create-inject-state-to-machine-prompts.js'

export const addStatusBlockHandler = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const userPrompts = await PromptsWizard.run<InjectStateToMachineOptions>({
    prompts: [
      ...(await createInjectStateToMachinePrompts({machineConfig})),
    ],
    validateAnswers: validateInjectStatusToMachineOptions,
  })

  await injectStateTransformer({
    ...userPrompts,
    machineName: machineConfig.machineName,
  })
}
