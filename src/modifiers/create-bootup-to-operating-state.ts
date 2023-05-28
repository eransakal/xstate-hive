import {Configuration} from '../configuration.js'
import {executePlopJSCommand} from '../utils/execute-plopljs-command.js'
import {join} from 'path'

interface ModifierOptions {
    machinePath: string,
    machineName: string,
    parents: string[];
    stateName: string;
}

export const createBootupToOperatingState = async ({
  parents,
  machinePath,
  machineName,
  stateName,
}: ModifierOptions): Promise<void> => {
  const projectConfiguration = Configuration.get()

  const basePath = join(machinePath, parents?.length ?
    `machine-states/${parents.join('/')}` :
    'machine-states')

  console.log(basePath)
  return executePlopJSCommand({
    commandPath: ['state', 'create', 'bootup-to-operating'],
    destPath: basePath,
    options: {
      stateName,
      machineName,
      relativePathToMachine: '',
      isKME: projectConfiguration?.getGlobal('isKME', false) ?? false,
    },
  })
}
