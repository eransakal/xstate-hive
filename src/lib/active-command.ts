import {Command} from '@oclif/core'

interface CommandProxy {
  log: Command['log'],
  error: Command['error'],
  debug: Command['debug']
}
let _command: CommandProxy


export const setActiveCommand = (command: Command, debug: Command['debug']): void => {
  _command = {
    debug: debug.bind(command),
    log: command.log.bind(command),
    error: command.error.bind(command),
  }
}


export const getActiveCommand = (): CommandProxy => _command

