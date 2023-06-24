import * as path from 'path'
import {toDashCase} from './formatters.js'
import {MachineState} from './get-machine-states.js'

export const getStatePath = (parentState: MachineState, stateName: string): string => {
  const stateRelativePath = parentState.id  ?
    `./${toDashCase(stateName)}-state` :
    `../machine-states/${toDashCase(stateName)}-state`

  return path.resolve(path.dirname(parentState.filePath), stateRelativePath)
}
