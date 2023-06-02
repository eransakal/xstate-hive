import * as url from 'url'
import {join} from 'path'
import {readFileSync} from 'fs'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default async function (plop) {
  const xstateLoggerContent = await readFileSync(join(__dirname, '../../partials/xstate-logger.hbs'), 'utf-8')
  plop.setPartial('xstateLogger', xstateLoggerContent)

  plop.setHelper('dynamicParam', function (variable, suffix) {
    const result = variable + suffix
    return result
  })

  // controller generator
  plop.setGenerator('run', {
    description: 'application controller logic',
    actions: [
      {
        type: 'addMany',
        destination: './',
        base: './templates',
        templateFiles: './templates/**/**.hbs',
      },
    ],
  })
}
