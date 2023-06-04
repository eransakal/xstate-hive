import * as path from 'node:path'
import {readFileSync, existsSync, writeFileSync} from 'fs'

let sharedConfiguration : Configuration | null = null

export interface MachineConfiguration {
  path: string;
}
export interface Machine {
  machineName: string;
  config: MachineConfiguration,
  getAbsolutePath: () => string;
}

interface ProjectGlobals {
  presets?: string[];
}

export interface ProjectConfiguration {
  globals: ProjectGlobals
  machines: Record<string, MachineConfiguration>;
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

  updateMachineConfig(
    machineName: string,
    updates: Partial<MachineConfiguration>,
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

  addMachineConfig(machineName: string, machineConfig: MachineConfiguration, autoSave = true): void {
    this.config.machines[machineName] = machineConfig
    if (autoSave) {
      this.save()
    }
  }

  getMachine(machineName: string): Machine {
    const machineConfig = this.config.machines[machineName]

    if (!machineConfig) {
      throw new Error(`machine '${machineName}' does not exist`)
    }

    return {
      machineName,
      config: machineConfig,
      getAbsolutePath: () => path.resolve(this.root, machineConfig.path),
    }
  }
}
