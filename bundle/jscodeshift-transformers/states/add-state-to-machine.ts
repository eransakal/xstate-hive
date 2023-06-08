import {JSCodeshift, Transform, VariableDeclarator} from 'evcodeshift'
import fs from 'fs'

function duplicateAndStripLoc(obj: Record<string, any>): Record<string, any> {
  const duplicatedObj: Record<string, any> = {}

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (prop === 'loc') {
        continue // Skip the "loc" property
      }

      const value = obj[prop]
      if (typeof value === 'object' && value !== null) {
        duplicatedObj[prop] = duplicateAndStripLoc(value) // Recursively process nested objects
      } else {
        duplicatedObj[prop] = value
      }
    }
  }

  return duplicatedObj
}

function saveDiagnostic(path: string, raw: any) {
  const content = duplicateAndStripLoc(raw)
  fs.writeFileSync(path, JSON.stringify(content, null, 2))
}

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

function findStateChildStates(j: JSCodeshift, ast: Collection<any>) {
  const statesPath = ast
  .find(j.Identifier)
  .filter(path => {
    return path.value.name === 'states' &&
    path.parentPath.parentPath.parentPath.parentPath.value.type === 'VariableDeclarator'
  })
  .map(path => {
    return path.parentPath
  })

  if (statesPath.length === 0) {
    return null
  }

  return statesPath.at(0).get().value.value
}

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const ast = j(fileInfo.source)

  let parentStatesPath = findCreateMachine(j, ast) || findStateChildStates(j, ast)

  if (!parentStatesPath) {
    throw new Error('failed to find createMachine call or states property')
  }

  const {pathToParentStateInFile} = options

  if (pathToParentStateInFile) {
    console.log(`resolving the path to the parent state '${pathToParentStateInFile}'`)

    for (const pathPart of pathToParentStateInFile.split('.')) {
      console.log(`looking for state '${pathPart}'`)

      let childPath = parentStatesPath.properties.find(path => path.key.name === pathPart)

      if (childPath) {
        console.log('found state')
      } else {
        console.log('state is missing, adding it')
        childPath = j.property(
          'init',
          j.identifier(pathPart),
          j.objectExpression([]),
        )
        parentStatesPath.properties.push(childPath)
      }

      console.log('looking for states property')
      const childPropertiesPath = childPath.value.properties

      parentStatesPath =  childPropertiesPath?.find(item => item.key.name === 'states')

      if (parentStatesPath) {
        console.log('found states property')
      } else {
        console.log('property states is missing, adding it')
        parentStatesPath = j.property(
          'init',
          j.identifier('states'),
          j.objectExpression([]),
        )
        childPropertiesPath.push(
          parentStatesPath,
        )
      }

      parentStatesPath = parentStatesPath.value
    }
  }

  parentStatesPath.properties.push(
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
