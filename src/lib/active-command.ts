import {Command} from '@oclif/core'

let _command: Command
let _commandDebug: Command['debug']

export const setActiveCommand = (command: Command, debug: Command['debug']): void => {
  _command = command
  _commandDebug = debug
}

export const getActiveCommand = (): Command => _command
export const getActiveCommandDebug = (): Command['debug'] => _commandDebug
