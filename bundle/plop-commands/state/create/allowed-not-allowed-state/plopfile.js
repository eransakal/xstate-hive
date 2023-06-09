export default function (plop) {
  // controller generator
  plop.setGenerator('run', {
    description: '',
    actions: [
      {
        type: 'add',
        path: './',
        templateFile: './templates/state.ts.hbs',
      },
    ],
  })
}
