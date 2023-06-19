// import {ux} from '@oclif/core'
// import {Configuration} from '../configuration.js'
// import * as path from 'path'
// import {executeJSCodeshiftTransformer} from '../utils/execute-jscodeshift-transformer.js'
// import {join, relative} from 'path'
// import {executePlopJSCommand} from '../utils/execute-plopljs-command.js'
// import {StateBlockOptions} from '../prompt-state-block-options.js'

// export interface InjectStateOptions {
//   machineName: string,
//   selectedStateFilePath: string;
//   selectedStateParentsInFile: string[]
//   newStateName: string;
//   newStateDirPath: string;
//   newStateOptions: StateBlockOptions
// }

// export const injectStatusBlockTransformer = async (
//   options : InjectStateOptions): Promise<void> => {
//   const {
//     machineName,
//     newStateOptions,
//     selectedStateFilePath,
//     selectedStateParentsInFile,
//     newStateName,
//     newStateDirPath,
//   } = options
//   const projectConfiguration = Configuration.get()
//   const machineConfig = projectConfiguration.getMachine(machineName)

//   const absoluteStateFilePath = path.isAbsolute(selectedStateFilePath) ? selectedStateFilePath : join(
//     machineConfig.getAbsolutePath(),
//     selectedStateFilePath,
//   )

//   const plopCommandPath = 'block/state'

//   const absoluteNewStatePath = path.resolve(path.dirname(absoluteStateFilePath), newStateDirPath)
//   const newStatePathForUX = path.relative(machineConfig.getRoot(), absoluteNewStatePath)
//   const stateFilePathForUX = path.relative(machineConfig.getRoot(), absoluteStateFilePath)
//   const pathToParentStateInFile = relative(machineConfig.getAbsolutePath(), absoluteNewStatePath)
//   ux.action.start(`generate new state '${newStateName}' files in '${newStatePathForUX}'`)
//   await executePlopJSCommand({
//     commandPath: plopCommandPath,
//     destPath: absoluteNewStatePath,
//     options: {
//       ...newStateOptions,
//       stateName: newStateName,
//       machineName,
//       relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
//       isKME: projectConfiguration.isPresetActive('kme'),
//     },
//   })
//   ux.action.stop()

//   ux.action.start(`inject new state '${newStateName}' in '${stateFilePathForUX}'`)
//   await executeJSCodeshiftTransformer({
//     transformerPath: 'states/inject-state-to-machine.ts',
//     destFilePath: absoluteStateFilePath,
//     options: {
//       stateName: newStateName,
//       pathToParentStateInFile: selectedStateParentsInFile.join('.'),
//       stateImportName: `${newStateName}State`,
//       stateImportPath: newStateDirPath,
//     },
//   })
//   ux.action.stop()
// }
