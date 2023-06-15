import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import {spawnSync} from 'child_process'
import {extname} from 'path'
import {getActiveCommand, getActiveCommandDebug} from '../active-command.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface TransformOptions {
    transformerPath : string,
    destFilePath: string,
    options: Record<string, string>;
  }

export const executeJSCodeshiftTransformer = async ({
  transformerPath,
  destFilePath,
  options,
}: TransformOptions): Promise<void> => {
  const debug = getActiveCommandDebug()

  const resolvedTransformerPath = resolve(
    __dirname,
    `../../../bundle/jscodeshift-transformers/${transformerPath}`,
  )

  const jscodemodCMD = resolve(
    __dirname,
    '../../../node_modules/.bin/evcodeshift',
  )

  const parser = extname(destFilePath) === '.tsx' ? 'tsx' : 'ts'

  debug(`execute jscodeshift transformer ${transformerPath} on ${destFilePath} (parser ${parser})`)

  const jscodemodOptions = Object.entries(options).map(([key, value]) => `--${key}=${value}`)
  debug(jscodemodOptions)
  const {stderr, stdout} = spawnSync(
    'node',
    [jscodemodCMD, '--parser', parser, '-t', resolvedTransformerPath, destFilePath, ...jscodemodOptions],
    {encoding: 'utf-8'},
  )

  if (stderr) {
    throw new Error(stderr)
  } else {
    debug(stdout)
  }
}
