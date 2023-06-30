import {JSCodeshift, Transform, VariableDeclarator} from 'evcodeshift'
import {duplicateAndStripLoc} from '../utils/diagnostics'

function findMachinePath(j: JSCodeshift, ast: Collection<any>) {
  const machineStatesPath = ast.find(j.CallExpression, {
    callee: {
      name: 'createMachine',
    },
  })

  if (machineStatesPath.length === 0) {
    return null
  }

  const statesProperty = machineStatesPath?.at(0)?.get()?.value?.arguments?.[0]?.properties?.find(
    property => {
      return property.key.name === 'states'
    },
  )

  if (!statesProperty) {
    return null
  }

  return {
    value: machineStatesPath?.at(0)?.get()?.value?.arguments?.[0],
  }
}

function findFileStatePath(j: JSCodeshift, ast: Collection<any>) {
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

  return statesPath.at(0).get().parentPath.parentPath
}

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const ast = j(fileInfo.source)

  const fileStatePath = findMachinePath(j, ast) || findFileStatePath(j, ast)

  if (!fileStatePath) {
    throw new Error('failed to find state object of the file')
  }

  let innerFileStatePath = fileStatePath

  const {pathToParentStateInFile} = options

  if (pathToParentStateInFile) {
    console.log(`resolving the path to the parent state '${pathToParentStateInFile}'`)

    const pathParts = pathToParentStateInFile.split('.')
    console.log(`finding the path to the parent state '${pathParts}'`)
    for (const pathPart of pathParts) {
      console.log(`looking for inner state '${pathPart}'`)

      let childPath = innerFileStatePath
      ?.value?.properties?.find(item => item.key.name === 'states')
      ?.value.properties.find(path => path.key.name === pathPart)

      if (childPath) {
        console.log('found state, continue')
      } else {
        console.log('state is missing, adding it')
        childPath = j.property(
          'init',
          j.identifier(pathPart),
          j.objectExpression([]),
        )
        innerFileStatePath
        .value.properties.find(item => item.key.name === 'states')
        .value.properties.push(childPath)
      }

      innerFileStatePath = childPath

      console.log(`looking for states property of '${pathPart}'`)
      const innerFileStateProperties = innerFileStatePath.value.properties

      if (!innerFileStateProperties) {
        throw new Error(`failed to find state properties of '${pathPart}'`)
      }

      const innerFileStateStatesPath =  innerFileStateProperties?.find(item => item.key.name === 'states')

      if (innerFileStateStatesPath) {
        console.log('found \'states\' property, continue')
      } else {
        console.log(`property \'states\' of inner state '${pathPart}' is missing, adding it`)
        innerFileStateProperties.push(
          j.property(
            'init',
            j.identifier('states'),
            j.objectExpression([]),
          ),
        )
      }
    }
  }

  console.log(`resolving status of new state '${options.stateName}'`)
  const newStatePath = innerFileStatePath
  ?.value?.properties?.find(item => item.key.name === 'states')
  ?.value?.properties?.find(path => path.key.name === options.stateName)

  if (newStatePath) {
    console.log('state exists, changing it')
    newStatePath.value = j.identifier(options.stateImportName)
  } else {
    console.log('state is missing, adding it')
    innerFileStatePath.value.properties.find(path => path.key.name === 'states')
    .value.properties.push(
      j.property(
        'init',
        j.identifier(options.stateName),
        j.identifier(options.stateImportName),
      ),
    )
  }

  if (options.forceTypeParallel) {
    console.log('changing type of state to \'parallel\'')
    let typePath = innerFileStatePath.value.properties.find(path => path.key.name === 'type')
    // eslint-disable-next-line max-depth
    if (typePath) {
      console.log('found type property, changing to parallel')
      typePath.value = j.stringLiteral('parallel')
    } else {
      console.log('type property is missing, adding it with value parallel')
      typePath = j.property(
        'init',
        j.identifier('type'),
        j.stringLiteral('parallel'),
      )
      innerFileStatePath.value.properties.unshift(typePath)
    }
  }

  // Build a new import
  console.log('adding import to the state file')
  const newImport = j.importDeclaration(
    [j.importSpecifier(j.identifier(options.stateImportName))],
    j.stringLiteral(options.stateImportPath),
  )
  // Insert it at the top of the document
  ast.get().node.program.body.unshift(newImport)

  return ast.toSource()
}

export default transform
