import {Transform} from 'jscodeshift'

const isStatesProperty = nodePath => {
  return (
    nodePath?.parent?.value?.key?.name === 'states' &&
    nodePath?.parent?.parent?.parent?.parent?.value?.expressions?.length ===
      2 &&
    nodePath?.parent?.parent?.parent?.parent?.value?.expressions[0]?.left
    ?.name === 'createMachine'
  )
}

const transform: Transform = (fileInfo, api, options) => {
  const jscodeshift = api.jscodeshift
  return jscodeshift(fileInfo.source)
  // eslint-disable-next-line unicorn/no-array-callback-reference
  .find(jscodeshift.ObjectExpression)
  .filter(x => isStatesProperty(x))
  .replaceWith(() => {
    return jscodeshift.objectExpression([
      jscodeshift.property(
        'init',
        jscodeshift.identifier(options.stateName),
        jscodeshift.identifier(options.stateImportName),
      ),
    ])
  })
  .toSource()
}

export default transform
