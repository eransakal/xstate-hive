import {ux} from '@oclif/core'
import {Configuration} from '../configuration.js'
import * as path from 'path'
import {executeJSCodeshiftTransformer} from '../utils/execute-jscodeshift-transformer.js'
import {join, relative} from 'path'
import {executePlopJSCommand} from '../utils/execute-plopljs-command.js'
import {StateTypes} from '../data.js'

interface ModifierOptions {
  machineName: string,
  selectedStateFilePath: string;
  selectedStateInnerFileParents: string[]
  newStateName: string;
  newStateType: StateTypes,
  newStateDirPath: string;
}

const getFileByStateType = (stateType: StateTypes): string => {
  switch (stateType) {
  case StateTypes.AllowedNotAllowed:
    return 'state/create/allowed-not-allowed-state'
  case StateTypes.AllowedNotAllowedWithLoading:
    return 'state/create/allowed-not-allowed-with-loading-state'
  case StateTypes.OperationalNotOperational:
    return 'state/create/operational-non-operational-state'
  case StateTypes.OperationalNotOperationalWithLoading:
    return 'state/create/operational-non-operational-with-loading-state'
  case StateTypes.OperationalWithLoading:
    return 'state/create/operational-with-loading-state'
  case StateTypes.Operational:
    return 'state/create/operational-state'
  default:
    throw new Error(`cannot find plopjs command for state type '${stateType}'`)
  }
}

export const injectMachineState = async ({
  machineName,
  newStateType: stateType,
  selectedStateFilePath,
  selectedStateInnerFileParents,
  newStateName,
  newStateDirPath,
}: ModifierOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(machineName)

  const absoluteStateFilePath = path.isAbsolute(selectedStateFilePath) ? selectedStateFilePath : join(
    machineConfig.getAbsolutePath(),
    selectedStateFilePath,
  )

  const plopCommandPath = getFileByStateType(stateType)

  const absoluteNewStatePath = path.resolve(path.dirname(absoluteStateFilePath), newStateDirPath)
  const newStatePathForUX = path.relative(machineConfig.getRoot(), absoluteNewStatePath)
  const stateFilePathForUX = path.relative(machineConfig.getRoot(), absoluteStateFilePath)
  const pathToParentStateInFile = relative(machineConfig.getAbsolutePath(), absoluteNewStatePath)
  ux.action.start(`generate new state '${newStateName}' files in '${newStatePathForUX}'`)
  await executePlopJSCommand({
    commandPath: plopCommandPath,
    destPath: absoluteNewStatePath,
    options: {
      stateName: newStateName,
      machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
  ux.action.stop()

  ux.action.start(`inject new state '${newStateName}' in '${stateFilePathForUX}'`)
  await executeJSCodeshiftTransformer({
    transformerPath: 'states/inject-state-to-machine.ts',
    destFilePath: absoluteStateFilePath,
    options: {
      stateName: newStateName,
      pathToParentStateInFile: selectedStateInnerFileParents.join('.'),
      stateImportName: `${newStateName}State`,
      stateImportPath: newStateDirPath,
    },
  })
  ux.action.stop()
}
