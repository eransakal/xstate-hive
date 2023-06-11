import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import nodePlop from 'node-plop'
import {getCommandLogger} from '../command-logger.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface CommandOptions {
  commandPath: string,
  destPath: string;
  options: Record<string, unknown>;
}

export const executePlopJSCommand = async ({
  commandPath,
  destPath: basePath,
  options,
}: CommandOptions): Promise<void> => {
  const logger = getCommandLogger()
  
  const plopCommandPath = resolve(
    __dirname,
    `../../bundle/plop-commands/${commandPath}/plopfile.js`,
  )
  logger.debug(`execute plopjs '${commandPath}' on '${basePath}'`)
  logger.debug(options)
  const plop = await nodePlop(plopCommandPath, {
    force: false,
    destBasePath: basePath,
  } as any)

  const generator = plop.getGenerator('run')

  const {failures} =  await generator.runActions(options)

  if (failures.length > 0) {
    throw new Error([`failed to run command '${commandPath}`, JSON.stringify(failures)].join('\n'))
  }
}
