import {Configuration} from '../../configuration.js'
import {getActiveCommand, getActiveCommandDebug} from '../../active-command.js'
import {injectStatusBlock} from './inject-status-block.js'
import inquirer from 'inquirer'
import {formatMachineName} from '../../commands-utils/formatters.js'

export  const generateBlock = async (prefilled :  { machineName: string | undefined }): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const activeCommand = getActiveCommand()
  const debug = getActiveCommandDebug()

  let machineName = prefilled.machineName
  try {
    machineName = formatMachineName(
      machineName || (await inquirer.prompt([
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
  } catch (error: any) {
    debug(error)
    activeCommand.error(`machine '${machineName}' not found, please verify that the machine is registered in '.xstate-hive.json' file.`, {exit: 1})
  }
}
