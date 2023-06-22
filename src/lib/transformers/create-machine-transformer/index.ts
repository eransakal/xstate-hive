import {join} from 'path'
import {Configuration} from '../../configuration.js'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'
import {CreateMachineOptions, validateCreateMachineOptions} from './types.js'

export const createMachineTransformer = async ({
  machinePath,
  machineName,
}: CreateMachineOptions): Promise<void> => {
  if (!validateCreateMachineOptions({machinePath, machineName})) {
    throw new Error('Invalid options')
  }

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
