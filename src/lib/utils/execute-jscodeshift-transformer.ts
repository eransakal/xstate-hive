import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import {spawnSync} from 'child_process'
import {extname} from 'path'
import {getActiveCommand} from '../active-command.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface TransformOptions {
  transformerPath : string,
  destFilePath: string,
  options: Record<string, string>;
}

const executeJSCodeshiftCommand = ({
  transformerPath,
  destFilePath,
  options,
}: TransformOptions): string[] => {
  const {debug} = getActiveCommand()

  const resolvedTransformerPath = resolve(
    __dirname,
    `../../../bundle/jscodeshift-transformers/${transformerPath}`,
  )

  // const jscodemodCMD = resolve(
  //   __dirname,
  //   '../../../node_modules/.bin/evcodeshift',
  // )

  const parser = extname(destFilePath) === '.tsx' ? 'tsx' : 'ts'

  const jscodemodOptions = Object.entries(options).map(([key, value]) => `--${key}=${value}`)

  const command = ['npx', 'evcodeshift', '--verbose', '2', '--parser', parser, '-t', resolvedTransformerPath, destFilePath, ...jscodemodOptions]

  debug(`Executing command: ${command.join(' ')}`)

  return command
}

export const executeJSCodeshiftTransformer = async ({
  transformerPath,
  destFilePath,
  options,
}: TransformOptions): Promise<void> => {
  const {debug} = getActiveCommand()

  const command = executeJSCodeshiftCommand({transformerPath, destFilePath, options})

  const {stderr, stdout} = spawnSync(
    command[0],
    command.slice(1),
    {encoding: 'utf-8',
      env: {...process.env}},
  )

  debug(`stdErr: ${stderr || ''}`)
  debug(`stdOut: ${stdout || ''}`)

  if (!stdout.includes('0 errors')) {
    throw new Error(`Error executing jscodeshift transformer: ${transformerPath}\nstdErr: ${stderr || ''}\nstdOut: ${stdout || ''}`)
  }
}
