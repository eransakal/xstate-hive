import {toCamelCase, toPascalCase} from '../../utils.js'
import * as url from 'url'
import {join} from 'path'
import {readFileSync} from 'fs'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default async function (plop) {
  plop.setHelper('pathToPascalCase', function (fullPath) {
    return fullPath.split('.').map(value => toPascalCase(value)).join('')
  })

  plop.setHelper('optionalPath', function (fullPath) {
    return fullPath.split('.').map(value => toCamelCase(value)).join('?.')
  })

  // eslint-disable-next-line no-warning-comments
  // TODO should remove duplications
  const xstateLoggerContent = await readFileSync(join(__dirname, '../../partials/xstate-logger.hbs'), 'utf-8')
  plop.setPartial('xstateLogger', xstateLoggerContent)
  plop.setHelper('appendSuffix', function (variable, suffix) {
    const result = variable + suffix
    return result
  })

  // controller generator
  plop.setGenerator('run', {
    description: '',

    actions: [
      {
        type: 'addMany',
        destination: './',
        base: './templates',
        templateFiles: './templates/**/*.hbs',
      },
    ],
  })
}
