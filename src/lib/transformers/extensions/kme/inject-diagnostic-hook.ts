import {Configuration} from '../../../configuration.js'
import {toDashCase} from '../../../utils.js'
import {executeJSCodeshiftTransformer} from '../../../utils/execute-jscodeshift-transformer.js'
import {join} from 'path'

interface ModifierOptions {
  machineName: string,
}

export const injectDiagnosticHook = async ({
  machineName,
}: ModifierOptions): Promise<void> => {
  const machineConfig = Configuration.get().getMachine(machineName)

  const destPath = join(
    machineConfig.getAbsolutePath(),
    `${toDashCase(machineName)}-provider.tsx`,
  )
  return executeJSCodeshiftTransformer({
    transformerPath: 'extensions/kme/inject-diagnostic-hook.ts',
    destFilePath: destPath,
    options: {
      name: machineName,
    },
  })
}

