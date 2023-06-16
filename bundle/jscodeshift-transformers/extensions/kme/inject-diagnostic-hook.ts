import {JSCodeshift, Transform} from 'jscodeshift'
import {toLowerCamelCase, toPascalCase} from '../../utils'

function findUseMachineAssignment(j: JSCodeshift, ast: Collection<any>): null {
  const assignment = ast.find(j.VariableDeclarator, {
    init: {
      callee: {name: 'useMachine'},
    },
  })

  if (assignment.length === 0) {
    // If assignment is not found, return null or handle the case accordingly
    return null
  }

  return assignment.at(0).get()
}

const extendImport = (j: JSCodeshift, ast: Collection<any>, importPath: string, newIdentifier: string) => {
  const assignment = ast.find(j.ImportDeclaration, {
    source: {value: importPath},
  })

  if (assignment.length === 0) {
    throw new Error(`failed to find types import '${importPath}'`)
  }

  const path = assignment.at(0).get()

  const importSpecifier = j.importSpecifier(j.identifier(newIdentifier))
  const specifiers = path.node.specifiers
  const lastSpecifier = specifiers[specifiers.length - 1]

  if (lastSpecifier && (lastSpecifier.type === 'ImportDefaultSpecifier' || lastSpecifier.type === 'ImportSpecifier')) {
    path.node.specifiers.splice(specifiers.length, 0, importSpecifier)
  } else {
    path.node.specifiers.unshift(importSpecifier)
  }
}

export const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const ast = j(fileInfo.source)

  try {
    const useMachinePath = findUseMachineAssignment(j, ast)

    if (!useMachinePath) {
      throw new Error('failed to find useMachine call')
    }

    const machineIdentifierId = `${toPascalCase(options.name)}MachineId`
    // add the hook
    const useXStateDiagnosticsStatement = j.expressionStatement(
      j.callExpression(j.identifier('useXStateDiagnostics'), [
        j.objectExpression([
          j.objectProperty(j.identifier('machineId'), j.identifier(machineIdentifierId)),
          j.objectProperty(j.identifier('machineLogger'), j.identifier('logger')),
          j.objectProperty(j.identifier('service'), j.identifier(`${toLowerCamelCase(options.name)}MachineService`)),
        ]),
      ]))
    useMachinePath.parent.insertAfter(useXStateDiagnosticsStatement)

    extendImport(j, ast, './types', machineIdentifierId)
    extendImport(j, ast, '@kme/room-diagnostics-utils-diagnostics', 'useXStateDiagnostics')
  } catch (error) {
    throw new Error(`file structure is invalid. ${error.message}`)
  }

  return ast.toSource()
}

export default transform
