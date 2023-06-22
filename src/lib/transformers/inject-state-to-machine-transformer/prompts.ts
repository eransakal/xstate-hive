import {Prompt} from '../../utils/prompts-wizard.js'
import {InjectStateToMachineOptions} from './types.js'
import {MachineConfig} from '../../configuration.js'
import {createMachineNamePrompt, createStateToModifyPrompt} from '../../utils/prompts.js'

export const createInjectStateToMachinePrompts = async ({machineConfig}: {
  machineConfig: MachineConfig
}): Promise<Prompt<InjectStateToMachineOptions>[]> => {
  return [
    createMachineNamePrompt(),
    (await createStateToModifyPrompt(machineConfig)),
  ]
}
