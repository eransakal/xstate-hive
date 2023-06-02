import {Configuration} from '../configuration.js'
import {executePlopJSCommand} from '../utils/execute-plopljs-command.js'
import {join} from 'path'

interface ModifierOptions {
  machinePath: string
  machineName: string
  parents: string[]
  stateName: string
}

export const createBootupToOperationalState = async ({
  parents,
  machinePath,
  machineName,
  stateName,
}: ModifierOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()

  const basePath = join(
    machinePath,
    parents?.length ? `machine-states/${parents.join('/')}` : 'machine-states',
  )

  return executePlopJSCommand({
    commandPath: 'state/create/bootup-to-operational',
    destPath: basePath,
    options: {
      stateName,
      machineName,
      relativePathToMachine: '',
      isKME: projectConfiguration?.getGlobal('isKME', false) ?? false,
    },
  })
}
