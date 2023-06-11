import {Configuration} from '../configuration.js'
import * as path from 'path'
import {executeJSCodeshiftTransformer} from '../utils/execute-jscodeshift-transformer.js'
import {join} from 'path'
import {executePlopJSCommand} from '../utils/execute-plopljs-command.js'
import {StateTypes} from '../data.js'
import {toDashCase, toLowerCamelCase} from '../utils.js'

interface ModifierOptions {
  machineName: string,
  stateType: StateTypes,
  stateName: string;
  pathToParentStateInFile: string;
  stateFilePath: string;
  stateImportPath: string;
}

const getFileByStateType = (stateType: StateTypes): string => {
  switch (stateType) {
  case StateTypes.AllowedNotAllowed:
    return 'state/create/allowed-not-allowed-state'
  case StateTypes.AllowedNotAllowedWithLoading:
    return 'state/create/allowed-not-allowed-with-loading-state'
  case StateTypes.OperationalNotOperational:
    return 'state/create/operational-not-operational-state'
  case StateTypes.OperationalNotOperationalWithLoading:
    return 'state/create/operational-not-operational-with-loading-state'
  default:
    throw new Error(`unknown state type '${stateType}'`)
  }
}

export const injectMachineState = async ({
  machineName,
  pathToParentStateInFile,
  stateType,
  stateName,
  stateFilePath,
  stateImportPath,
}: ModifierOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const machineConfig = projectConfiguration.getMachine(machineName)

  const resolvedStateFilePath = join(
    machineConfig.getAbsolutePath(),
    stateFilePath,
  )

  const plopCommandPath = getFileByStateType(stateType)

  await executeJSCodeshiftTransformer({
    transformerPath: 'states/add-state-to-machine.ts',
    destFilePath: resolvedStateFilePath,
    options: {
      stateName: stateName,
      pathToParentStateInFile,
      stateImportName: `${stateName}State`,
      stateImportPath: `${toDashCase(stateImportPath)}`,
    },
  })

  const resolvedDestStatePath = path.resolve(path.dirname(resolvedStateFilePath), stateImportPath)

  await executePlopJSCommand({
    commandPath: plopCommandPath,
    destPath: resolvedDestStatePath,
    options: {
      stateName,
      machineName,
      relativePathToMachine: '',
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
}
