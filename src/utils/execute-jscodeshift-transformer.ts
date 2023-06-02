import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import {spawnSync} from 'child_process'
import {extname} from 'path'
import {getCommandLogger} from '../command-logger.js'

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
  const resolvedTransformerPath = resolve(
    __dirname,
    `../../bundle/jscodeshift-transformers/${transformerPath}`,
  )

  const jscodemodCMD = resolve(
    __dirname,
    '../../node_modules/.bin/evcodeshift',
  )

  const parser = extname(destFilePath) === '.tsx' ? 'tsx' : 'ts'

  getCommandLogger().log(`execute jscodeshift transformer ${transformerPath} on ${destFilePath} (parser ${parser})`)

  const jscodemodOptions = Object.entries(options).map(([key, value]) => `--${key}=${value}`)
  const {stderr, stdout} = spawnSync(
    'node',
    [jscodemodCMD, '--parser', parser, '-t', resolvedTransformerPath, destFilePath, ...jscodemodOptions],
    {encoding: 'utf-8'},
  )

  if (stderr) {
    throw new Error(stderr)
  } else {
    console.log(stdout)
  }
}
