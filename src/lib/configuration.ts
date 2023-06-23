import * as path from 'node:path'
import {readFileSync, existsSync, writeFileSync} from 'fs'
import {toDashCase} from './utils/formatters.js'
import * as fs from 'fs'
import {CLIError} from '@oclif/core/lib/errors/index.js'

let sharedConfiguration : Configuration | null = null

export interface MachineContext {
  coreLibraries: Record<string, string>
  autoGenerated: boolean;
}
export interface MachineConfig {
  machineName: string;
  context: MachineContext,
  getAbsolutePath: () => string;
}

interface ProjectGlobals {
  presets?: string[];
}

export interface ProjectConfiguration {
  version: string,
  globals: ProjectGlobals
  machines: Record<string, {
    path: string,
    context: MachineContext
  }>;
}

const projectConfigurationFileName = '.xstate-hive.json'

export class Configuration {
  // eslint-disable-next-line no-useless-constructor
  private constructor(
    public root: string,
    public config: ProjectConfiguration,
  ) {}

  static create(globals: ProjectGlobals): Configuration {
    const root = process.cwd()
    const configFilePath = path.resolve(root, projectConfigurationFileName)

    const config: ProjectConfiguration = {
      version: '1.0.0',
      globals,
      machines: {},
    }

    if (!existsSync(configFilePath)) {
      writeFileSync(configFilePath, JSON.stringify(config, null, 4), 'utf-8')
      return new Configuration(root, config)
    }

    throw new Error(`a configuration file "${projectConfigurationFileName}" already exists`)
  }

  static get(): Configuration {
    if (sharedConfiguration) {
      return sharedConfiguration
    }

    const root = process.cwd()
    const configFilePath = path.resolve(root, projectConfigurationFileName)

    if (existsSync(configFilePath)) {
      const config = JSON.parse(
        readFileSync(configFilePath, 'utf-8'),
      ) as ProjectConfiguration
      // eslint-disable-next-line no-warning-comments
      // TODO validate content
      if (config) {
        sharedConfiguration = new Configuration(root, config)
        return sharedConfiguration
      }
    }

    throw new Error(`missing configuration file "${projectConfigurationFileName}"`)
  }

  hasMachine(machine: string): boolean {
    return Boolean(this.config.machines[machine])
  }

  public save(): void {
    const filePath = path.resolve(this.root, projectConfigurationFileName)
    const content = JSON.stringify(this.config, null, 2)

    // eslint-disable-next-line no-warning-comments
    // TODO sort machines by names
    writeFileSync(filePath, content, 'utf-8')
  }

  getGlobal<T extends keyof ProjectGlobals>(key: T, defaultValue: ProjectGlobals[T]): ProjectGlobals[T] {
    return this.config.globals[key] || defaultValue
  }

  isPresetActive: (preset: string) => boolean = (preset: string) => {
    return this.config.globals.presets?.includes(preset) || false
  }

  getCoreLibrariesVersions = (): Record<string, string> => {
    const packageLockData = fs.readFileSync(path.resolve(this.root, 'package-lock.json'), 'utf-8')
    const packageLock = JSON.parse(packageLockData)

    const packages = packageLock.packages

    const result = {
      typescript: packages['node_modules/typescript']?.version,
      xstate: packages['node_modules/xstate']?.version,
      '@xstate/react': packages['node_modules/@xstate/react']?.version,
      '@xstate/immer': packages['node_modules/@xstate/immer']?.version,
      react: packages['node_modules/react']?.version,
    }

    if (process.env.NODE_ENV !== 'development') {
      const missingLibraries = Object.entries(result).filter(([_, value]) => !value)
      if (missingLibraries.length > 0) {
        throw new Error(`missing libraries: ${missingLibraries.map(([key]) => key).join(', ')} (please ensure that you have installed the dependencies))`)
      }
    }

    return result
  }

  updateMachineConfig(
    machineName: string,
    updates: Partial<MachineContext>,
  ): void {
    if (!this.config.machines[machineName]) {
      throw new Error(`machine '${machineName}' does not exist`)
    }

    this.config.machines[machineName] = {
      ...this.config.machines[machineName],
      ...updates,
    }
    this.save()
  }

  addMachineConfig(machineName: string, {path: machinePath}: {path: string}, autoSave = true): MachineConfig {
    const resolvedMachinePath = path.isAbsolute(machinePath) ? machinePath : path.join(this.root, machinePath)

    this.config.machines[machineName] = {
      path: resolvedMachinePath,
      context: {
        coreLibraries: this.getCoreLibrariesVersions(),
        autoGenerated: true,
      },
    }
    if (autoSave) {
      this.save()
    }

    return this.getMachine(machineName)
  }

  getRelativePath(targetPath: string): string {
    if (targetPath.startsWith('.')) {
      return targetPath
    }

    return path.relative(this.root, targetPath)
  }

  getMachine(machineName: string): MachineConfig {
    const resolvedMachineName = toDashCase(machineName)
    const machineConfig = this.config.machines[resolvedMachineName]

    if (!machineConfig) {
      throw new CLIError(`machine '${resolvedMachineName}' not registered, please verify that the machine is registered in '.xstate-hive.json' file.`)
    }

    return {
      machineName: resolvedMachineName,
      context: {...machineConfig.context},
      getAbsolutePath: () => path.resolve(this.root, machineConfig.path),
    }
  }
}
