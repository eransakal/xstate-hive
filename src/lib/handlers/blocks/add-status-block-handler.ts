import {MachineConfig} from '../../configuration.js'
import {PromptsWizard} from '../../utils/prompts-wizard.js'
import {createInjectStateToMachinePrompts} from '../../transformers/inject-state-to-machine-transformer/prompts.js'
import {InjectStateToMachineOptions, validateInjectStatusToMachineOptions} from '../../transformers/inject-state-to-machine-transformer/types.js'
import {injectStateTransformer} from '../../transformers/inject-state-to-machine-transformer/index.js'
import {getActiveCommand} from '../../active-command.js'
import {GenerateStatusBlockOptions, validateGenerateStatusBlockOptions} from '../../transformers/generate-status-block/types.js'
import {generateStatusBlockPrompts} from '../../transformers/generate-status-block/prompts.js'
import {isStringWithValue} from '../../utils/validators.js'

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

  const newStateName = injectStateToMachineOptions.newStateName || injectStateToMachineOptions.parentStateName.split('.')[[selectedState.split('.').length - 1]]
  const generateStatusBlockOptions =  await PromptsWizard.run<GenerateStatusBlockOptions>({
    machineName: machineConfig.machineName,
    newStateName,
    parentStateFilePath: `utils/create-${options.machineName}-machine.ts`,
  }, {
    prompts: [
      ...generateStatusBlockPrompts({
        alwaysOnAvailable: false,
        postNewStateNamePrompt: async data => {
          if (isStringWithValue(data.newStateName)) {
            data.newStateFolderPath = `../machine-states/${data.newStateName}-state`
          }
        }}),
    ],
    validateAnswers: validateGenerateStatusBlockOptions,
  })
  log(`inject '${injectStateToMachineOptions.newStateName || ''}' state into '${injectStateToMachineOptions.parentStateName || 'root'}' state`)
  await injectStateTransformer(injectStateToMachineOptions)

  // const stateFilePathForUX = path.relative(machineConfig.getRoot(), absoluteStateFilePath)
  // ux.action.start(`inject new state '${newStateName}' in '${stateFilePathForUX}'`)
  // await executeJSCodeshiftTransformer({
  //   transformerPath: 'states/inject-state-to-machine.ts',
  //   destFilePath: absoluteStateFilePath,
  //   options: {
  //     stateName: newStateName,
  //     pathToParentStateInFile: selectedStateParentsInFile.join('.'),
  //     stateImportName: `${newStateName}State`,
  //     stateImportPath: newStateFolderPath,
  //   },
  // })
  // ux.action.stop()
}
