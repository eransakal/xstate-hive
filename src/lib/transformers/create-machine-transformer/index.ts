import {join} from 'path'
import {Configuration} from '../../configuration.js'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'

export interface CreateMachineOptions {
  machineName: string,
  machinePath: string,
}

export function validateCreateMachineOptions(options: any): string | boolean {
  if (typeof options.machineName !== 'string' || !options.machineName) {
    return 'Machine name is required'
  }

  if (typeof options.machinePath !== 'string' || !options.machinePath) {
    return 'Machine path is required'
  }

  return true
}

export const createMachineTransformer = async ({
  machinePath,
  machineName,
}: CreateMachineOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()

  const destPath = join(machinePath, `${machineName}-machine`)
  return executePlopJSCommand({
    commandPath: 'machine/create',
    destPath,
    options: {
      name: machineName,
      isKME: projectConfiguration.isPresetActive('kme'),
    },
  })
}
