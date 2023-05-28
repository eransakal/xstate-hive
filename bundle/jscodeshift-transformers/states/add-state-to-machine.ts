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
  const j = api.jscodeshift
  const source = j(fileInfo.source)

  // eslint-disable-next-line unicorn/no-array-callback-reference
  source.find(j.ObjectExpression)
  .filter(x => isStatesProperty(x))
  .replaceWith(() => {
    return j.objectExpression([
      j.property(
        'init',
        j.identifier(options.stateName),
        j.identifier(options.stateImportName),
      ),
    ])
  })

  // Build a new import
  const newImport = j.importDeclaration(
    [j.importSpecifier(j.identifier(options.stateImportName))],
    j.stringLiteral(options.stateImportPath),
  )

  // Insert it at the top of the document
  source.get().node.program.body.unshift(newImport)

  return source.toSource()
}

export default transform
