import {Prompt} from '../../prompts/prompts-wizard.js'
import {InjectStateToMachineOptions} from './types.js'
import {MachineConfig} from '../../configuration.js'
import {createMachineNamePrompt, createStateToModifyPrompt} from '../../prompts/prompts.js'

export const createInjectStateToMachinePrompts = async ({machineConfig}: {
  machineConfig: MachineConfig
}): Promise<Prompt<InjectStateToMachineOptions>[]> => {
  return [
    (await createStateToModifyPrompt(machineConfig)),
  ]
}
