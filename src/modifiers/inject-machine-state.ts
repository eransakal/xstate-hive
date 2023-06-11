import {Configuration} from '../configuration.js'
import * as path from 'path'
import {executeJSCodeshiftTransformer} from '../utils/execute-jscodeshift-transformer.js'
import {join, relative, isAbsolute} from 'path'
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
  default:
    throw new Error(`unknown state type '${stateType}'`)
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

  const resolvedStateFilePath = path.isAbsolute(selectedStateFilePath) ? selectedStateFilePath : join(
    machineConfig.getAbsolutePath(),
    selectedStateFilePath,
  )

  const plopCommandPath = getFileByStateType(stateType)

  await executeJSCodeshiftTransformer({
    transformerPath: 'states/add-state-to-machine.ts',
    destFilePath: resolvedStateFilePath,
    options: {
      stateName: newStateName,
      pathToParentStateInFile: selectedStateInnerFileParents.join('.'),
      stateImportName: `${newStateName}State`,
      stateImportPath: newStateDirPath,
    },
  })

  const resolvedDestStatePath = path.resolve(path.dirname(resolvedStateFilePath), newStateDirPath)

  const pathToParentStateInFile = relative(machineConfig.getAbsolutePath(), resolvedDestStatePath)
  await executePlopJSCommand({
    commandPath: plopCommandPath,
    destPath: resolvedDestStatePath,
    options: {
      stateName: newStateName,
      machineName,
      relativePathToMachine: pathToParentStateInFile.split('/').map(() => '../').join(''),
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
}
