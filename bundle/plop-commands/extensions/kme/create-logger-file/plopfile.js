export default function (plop) {
  // controller generator
  plop.setGenerator('run', {
    description: '',
    actions: [
      {
        type: 'add',
        path: './',
        force: true,
        templateFile: './templates/logger.hbs',
      },
    ],
  })
}
