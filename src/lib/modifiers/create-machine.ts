import {Configuration} from '../configuration.js'
import {executePlopJSCommand} from '../utils/execute-plopljs-command.js'

interface ModifierOptions {
  machinePath: string;
    machineName: string;
}

export const createMachine = async ({
  machinePath,
  machineName,
}: ModifierOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()

  return executePlopJSCommand({
    commandPath: 'machine/create',
    destPath: machinePath,
    options: {
      name: machineName,
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
}
