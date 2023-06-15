import {Configuration} from '../../configuration.js'
import {getActiveCommand, getActiveCommandDebug} from '../../active-command.js'
import {injectStatusBlock} from './inject-status-block.js'
import inquirer from 'inquirer'
import {formatMachineName} from '../../utils.js'

export  const generateBlock = async (prefilled :  { machineName: string | undefined }): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const activeCommand = getActiveCommand()
  const debug = getActiveCommandDebug()

  const machineName = formatMachineName(
    prefilled.machineName || (await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: 'Enter the name of the new machine:',
      },
    ])).value)

  const machineConfig = projectConfiguration.getMachine(machineName)

  await injectStatusBlock({
    machineConfig,
  })
}
