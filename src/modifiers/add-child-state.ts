import {Configuration} from '../configuration.js'
import {executeJSCodeshiftTransformer} from '../utils/execute-jscodeshift-transformer.js'
import {join} from 'path'

interface ModifierOptions {
  machineName: string,
  stateName: string;
  parents: string[];
  stateImportPath: string;
}

export const addChildState = async ({
  machineName,
  parents,
  stateName,
  stateImportPath,
}: ModifierOptions): Promise<void> => {
  const machine = Configuration.get().getMachine(machineName)

  const parentStateFilePath = parents.length > 0 ?
    `machine-states/${parents.join('/')}` :
    `utils/create-${machineName.toLowerCase()}-machine.ts`

  const createMachineFilePath = join(
    machine.getAbsolutePath(),
    parentStateFilePath,
  )

  return executeJSCodeshiftTransformer({
    transformerPath: ['states', 'add-state-to-machine.ts'],
    destFilePath: createMachineFilePath,
    options: {
      stateName,
      stateImportName: `${stateName}State`,
      stateImportPath,
    },
  })
}
