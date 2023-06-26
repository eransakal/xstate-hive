import * as path from 'path'
import {toDashCase} from './formatters.js'
import {MachineState} from './get-machine-states.js'

export const getStatePath = (parentState: MachineState, stateName: string): string => {
  const stateRelativePath = path.join(getStateDirPath(parentState), `${toDashCase(stateName)}-state`)
  return path.resolve(path.dirname(parentState.filePath), stateRelativePath)
}

export const getStateDirPath = (parentState: MachineState): string => {
  const stateRelativePath = parentState.id  ?
    `./${toDashCase(parentState.name)}-states` :
    '../machine-states'

  return path.resolve(path.dirname(parentState.filePath), stateRelativePath)
}

