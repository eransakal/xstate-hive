export default function (plop) {
  // controller generator
  plop.setGenerator('run', {
    description: '',

    actions: [
      {
        type: 'addMany',
        destination: './',
        base: './templates/default',
        templateFiles: './templates/default/**/*.hbs',
      },
      {
        type: 'addMany',
        destination: './',
        skip: data => {
          return data.includeLoadingState ? null : 'loading disabled'
        },
        base: './templates/loading',
        templateFiles: './templates/loading/**/*.hbs',
      },
      {
        type: 'addMany',
        destination: './',
        skip: data => {
          return data.stateOffName ? null : 'always on mode'
        },
        base: './templates/stateOff',
        templateFiles: './templates/stateOff/**/*.hbs',
      },
    ],
  })
}
