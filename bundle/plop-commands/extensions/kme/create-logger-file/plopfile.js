export default function (plop) {
  // controller generator
  plop.setGenerator('run', {
    description: 'application controller logic',
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
