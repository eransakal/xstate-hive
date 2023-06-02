export default function (plop) {
  // controller generator
  plop.setGenerator('run', {
    description: 'application controller logic',

    actions: [
      {
        type: 'addMany',
        destination: '{{dashCase stateName}}',
        base: './templates',
        templateFiles: './templates/**/*.hbs',
      },
    ],
  })
}
