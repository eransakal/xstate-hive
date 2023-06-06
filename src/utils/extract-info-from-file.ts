import * as fs from 'fs'
import {dirname, resolve} from 'path'
import * as walk from 'acorn-walk'
import * as acorn from 'acorn'
import tsPlugin from 'acorn-typescript'
import {getCommandLogger, Logger} from '../command-logger.js'

interface State {
  name: string;
  filePath?: string;
  children: State[];
}

const isMachineStates = (node: any, ancestors: any): boolean => {
  const machineIndex = ancestors.length - 3

  return node.key.name === 'states' &&
    (machineIndex >= 0 &&
    ancestors?.[machineIndex].type === 'CallExpression' &&
    ancestors?.[machineIndex].callee.name === 'createMachine')
}

const isStateChildren = (node: any, ancestors: any): boolean => {
  const exportIndex = ancestors.length - 5
  return node.key.name === 'states' && exportIndex > 0 && ancestors[exportIndex].type === 'ExportNamedDeclaration'
}

const getStatesFromFile = (filePath: string, isMachineFile: boolean, logger: Logger): State[] => {
  let result: State[] = []
  logger.log(`extract states from '${filePath}' (isMachineFile: ${isMachineFile}))`)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const ast = acorn.Parser.extend(tsPlugin()).parse(fileContent, {
    sourceType: 'module',
    ecmaVersion: 'latest',
    locations: true,
  })

  let exportInstances = 0
  const fileImports: Record<string, string> = {}

  walk.ancestor(ast, {
    ImportDeclaration(node: any) {
      const stateName = node.specifiers?.[0].imported.name
      const statePath = node.source.value
      fileImports[stateName] = statePath
    },
    ExportNamedDeclaration() {
      exportInstances++
    },
  })

  if (exportInstances > 1) {
    throw new Error(`file '${filePath}' has more than one export, which is not supported`)
  }

  walk.ancestor(ast, {
    Property(node: any, state, ancestors) {
      const statesNode = isMachineFile ? isMachineStates(node, ancestors) : isStateChildren(node, ancestors)

      if (statesNode) {
        logger.log(`found states node of ${isMachineFile ? 'root state' : 'child state'}`)
        result =  getStatesFromNode({
          node,
          filePath,
          logger,
          fileImports})
      }
    },
  })

  return result
}

const getStatesFromNode = ({node, filePath, fileImports, logger}: {
    node: any,
    filePath: string,
    logger: Logger,
    fileImports: Record<string, string>}): State[]  => {
  const  result: State[] = []
  node.value.properties.forEach((property: any) => {
    const {key: {name: stateName}, value: {type: stateValueType, name: stateValueName}} = property

    if (stateValueType === 'ObjectExpression') {
      const childrenStates = property.value?.properties?.find((property: any) => property.key.name === 'states')

      const value: State = {
        name: stateName,
        children: [],
        filePath,
      }
      result.push(value)

      if (childrenStates) {
        value.children = getStatesFromNode({
          node: childrenStates,
          filePath,
          logger,
          fileImports})
      }
    } else if (stateValueType === 'Identifier') {
      const stateValuePath = fileImports[stateValueName]
      if (!stateValuePath) {
        throw new Error(`state '${stateValueName}' is not imported in '${filePath}'`)
      }

      let stateFilePath = `${resolve(dirname(filePath), stateValuePath)}`
      if (fs.existsSync(stateFilePath) && fs.lstatSync(stateFilePath).isDirectory()) {
        stateFilePath = `${stateFilePath}/index.ts`
      } else {
        stateFilePath = `${stateFilePath}.ts`
      }

      if (!fs.existsSync(stateFilePath)) {
        throw new Error(`state '${stateValueName}' not found in ${stateFilePath}'`)
      }

      const children = getStatesFromFile(stateFilePath, false, logger)
      result.push({
        name: stateName,
        children,
        filePath: stateFilePath,
      })
    }
  })

  return result
}

export const extractInfoFromFile = (filePath: string): State[] => {
  const logger = getCommandLogger()
  const states = getStatesFromFile(filePath, true, logger)
  console.dir(states, {depth: null})
  return states
}
