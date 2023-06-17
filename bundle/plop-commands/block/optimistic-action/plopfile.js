import {toCamelCase, toPascalCase} from '../../utils.js'

export default function (plop) {
  plop.setHelper('pathToPascalCase', function (fullPath) {
    return fullPath.split('.').map(value => toPascalCase(value)).join('')
  })

  plop.setHelper('optionalPath', function (fullPath) {
    return fullPath.split('.').map(value => toCamelCase(value)).join('?.')
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
