import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import nodePlop from 'node-plop'
import {getActiveCommand, getActiveCommandDebug} from '../active-command.js'

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
  const debug = getActiveCommandDebug()

  const plopCommandPath = resolve(
    __dirname,
    `../../../bundle/plop-commands/${commandPath}/plopfile.js`,
  )
  debug(`execute plopjs '${commandPath}' on '${basePath}'`)
  debug(options)
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
