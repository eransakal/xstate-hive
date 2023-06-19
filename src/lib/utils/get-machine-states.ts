import {join} from 'path'
import {Configuration} from '../configuration.js'
import {toDashCase} from './formatters.js'
import * as fs from 'fs'
import {dirname, resolve} from 'path'
import * as walk from 'acorn-walk'
import * as acorn from 'acorn'
import tsPlugin from 'acorn-typescript'

interface InnerMachineState {
  name: string;
  filePath: string;
  children: InnerMachineState[];
  hasContent: boolean,
  parents: string[]
  innerFileParentStates: string[]
}

export interface MachineState {
  id: string,
  name: string;
  filePath: string;
  innerFileParentStates: string[],
  hasContent: boolean,
}

function flattenStates(states: InnerMachineState[]): MachineState[] {
  const flattenedStates: MachineState[] = []
  function flatten(state: InnerMachineState) {
    const id = state.parents.length > 0 ? `${state.parents.join('.')}.${state.name}` : state.name
    flattenedStates.push({
      id,
      name: state.name,
      filePath: state.filePath,
      hasContent: state.hasContent,
      innerFileParentStates: state.innerFileParentStates,
    })
    for (const child of state.children) {
      flatten(child)
    }
  }

  for (const element of states) {
    flatten(element)
  }

  return flattenedStates
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

const getStatesFromFile = ({filePath, isMachineFile, parents}: { filePath: string; isMachineFile: boolean, parents: string[] }): InnerMachineState[] => {
  let result: InnerMachineState[] = []
  // logger.debug(`extract states from '${filePath}' (isMachineFile: ${isMachineFile}))`)
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
        // logger.log(`found states node of ${isMachineFile ? 'root state' : 'child state'}`)
        result =  getStatesFromNode({
          node,
          filePath,
          fileImports,
          fileParents: [],
          parents: [...parents]})
      }
    },
  })

  return result
}

const getStatesFromNode = ({node, filePath, fileImports, parents, fileParents}: {
    node: any,
    filePath: string,
    parents: string[],
    fileParents: string[],
    fileImports: Record<string, string>}): InnerMachineState[]  => {
  const  result: InnerMachineState[] = []
  // eslint-disable-next-line unicorn/no-array-for-each
  node.value.properties.forEach((property: any) => {
    const {key: {name: stateName}, value: {type: stateValueType, name: stateValueName}} = property

    if (stateValueType === 'ObjectExpression') {
      const childrenStates = property.value?.properties?.find((property: any) => property.key.name === 'states')

      const value: InnerMachineState = {
        name: stateName,
        children: [],
        filePath,
        hasContent: property.value?.properties?.length > 0,
        parents: [...parents],
        innerFileParentStates: [...fileParents],
      }
      result.push(value)

      if (childrenStates) {
        value.children = getStatesFromNode({
          node: childrenStates,
          filePath,
          fileImports,
          fileParents: [...fileParents, stateName],
          parents: [...parents, stateName]})
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

      const children = getStatesFromFile({filePath: stateFilePath, isMachineFile: false, parents: [...parents, stateName]})
      result.push({
        name: stateName,
        children,
        filePath: stateFilePath,
        hasContent: true,
        parents: [...parents],
        innerFileParentStates: [...fileParents],
      })
    }
  })

  return result
}

const extractStatesOfMachine = (filePath: string): MachineState[] => {
  const states = getStatesFromFile({filePath, isMachineFile: true, parents: []})
  return flattenStates(states)
}

export const getMachineStates = async (machineName: string, statePath?: string): Promise<MachineState[]> => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  return extractStatesOfMachine(resolvedStateFilePath)
}
