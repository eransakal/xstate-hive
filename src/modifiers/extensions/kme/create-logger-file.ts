import {Configuration} from '../../../configuration.js'
import {executePlopJSCommand} from '../../../utils/execute-plopljs-command.js'
import {join} from 'path'

interface ModifierOptions {
  machineName: string

}

export const createLoggerFile = async ({
  machineName,
}: ModifierOptions): Promise<void> => {
  const machineConfig = Configuration.get().getMachine(machineName)

  const destPath = join(
    machineConfig.getAbsolutePath(),
    'utils/logger.ts',
  )

  return executePlopJSCommand({
    commandPath: 'extensions/kme/create-logger-file',
    destPath,
    options: {
      name: machineName,
    },
  })
}
