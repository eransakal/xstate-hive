export default function (plop) {
  // controller generator
  plop.setGenerator('run', {
    description: '',

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
