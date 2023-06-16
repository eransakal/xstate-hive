import inquirer from 'inquirer'
import {getActiveCommand} from '../active-command.js'
import open from 'open'

export const promptListWithHelp = async <T>({defaultValue, message, choices, helpLink}: { defaultValue:T, message: string; choices: inquirer.prompts.PromptOptions['choices']['choices']; helpLink: string }): Promise<T> => {
  let result: T = null!

  let stopped = false

  while (!stopped) {
    // eslint-disable-next-line no-await-in-loop
    result = (await inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        default: defaultValue,
        message,
        choices: [
          ...choices,
          new inquirer.Separator(),
          {
            name: 'I\'m not sure what to choose, please assist me',
            value: 'help',
          },
        ],
      },
    ])).value

    if (result === 'help') {
      const {log} = getActiveCommand()
      log(`please visit '${helpLink}' for more information`)
      open(helpLink)
    } else {
      stopped = true
    }
  }

  return result
}
