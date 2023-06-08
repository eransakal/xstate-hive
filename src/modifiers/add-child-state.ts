import {Configuration} from '../configuration.js'
import {toDashCase} from '../utils.js'
import {executeJSCodeshiftTransformer} from '../utils/execute-jscodeshift-transformer.js'
import {join} from 'path'

interface ModifierOptions {
  machineName: string,
  stateName: string;
  pathToParentStateInFile: string;
  stateFilePath: string;
  stateImportPath: string;
}

export const addChildState = async ({
  machineName,
  pathToParentStateInFile,
  stateName,
  stateFilePath,
  stateImportPath,
}: ModifierOptions): Promise<void> => {
  const machine = Configuration.get().getMachine(machineName)

  const resolvedStateFilePath = join(
    machine.getAbsolutePath(),
    stateFilePath,
  )

  return executeJSCodeshiftTransformer({
    transformerPath: 'states/add-state-to-machine.ts',
    destFilePath: resolvedStateFilePath,
    options: {
      stateName,
      pathToParentStateInFile,
      stateImportName: `${stateName}State`,
      stateImportPath,
    },
  })
}
