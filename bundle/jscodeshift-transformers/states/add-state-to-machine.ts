import {JSCodeshift, Transform, VariableDeclarator} from 'jscodeshift'
import {toLowerCamelCase, toPascalCase} from '../../utils'

function findCreateMachine(j: JSCodeshift, ast: Collection<any>) {
  const assignment = ast.find(j.CallExpression, {
    callee: {
      name: 'createMachine',
    },
  })
  .filter(path => {
    const statesProperty = path.node.arguments[0]?.properties.find(
      property => property.key.name === 'states',
    )
    return statesProperty !== undefined
  })

  if (assignment.length === 0) {
    // If assignment is not found, return null or handle the case accordingly
    return null
  }

  return assignment.at(0).get()
}

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const ast = j(fileInfo.source)

  const path = findCreateMachine(j, ast)

  if (!path) {
    throw new Error('failed to find createMachine call or states property')
  }

  const statesProperty = path.node.arguments[0].properties.find(
    property => property.key.name === 'states',
  )

  statesProperty.value.properties.push(
    j.property(
      'init',
      j.identifier(options.stateName),
      j.identifier(options.stateImportName),
    ),
  )

  // Build a new import
  const newImport = j.importDeclaration(
    [j.importSpecifier(j.identifier(options.stateImportName))],
    j.stringLiteral(options.stateImportPath),
  )
  // Insert it at the top of the document
  ast.get().node.program.body.unshift(newImport)

  return ast.toSource()
}

export default transform
