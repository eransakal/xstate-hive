import {Configuration} from '../../configuration.js'
import {statusBlockHandler} from './status-block-handler.js'
import inquirer from 'inquirer'
import {formatMachineName} from '../../utils.js'
import {promptListWithHelp} from '../../utils/prompts.js'

export  const generateBlockHandler = async (prefilled :  { machineName: string | undefined }): Promise<void> => {
  const projectConfiguration = Configuration.get()
  const machineName = formatMachineName(
    prefilled.machineName || (await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: 'Enter the name of the machine:',
      },
    ])).value)

  const machineConfig = projectConfiguration.getMachine(machineName)

  const blockType = await promptListWithHelp(
    {
      defaultValue: 'status',
      message: 'Choose the block type to inject',
      choices: [
        {
          name: 'Status block',
          value: 'status',
        },
        {
          name: 'User optimistic action block',
          value: 'optimistic-action',
        },
      ], helpLink: 'https://sakalim.com/projects/react-architecture/application-state-with-xstate-4-guides-blocks#blocks-types',
    })

  switch (blockType) {
  case 'status':
    return statusBlockHandler({
      machineConfig,
    })
  case 'optimistic-action':
    // return optimisticActionBlockExecuter({
    //   machineConfig,
    // })
    throw new Error('Not implemented yet')
  }

  return Promise.resolve()
}
