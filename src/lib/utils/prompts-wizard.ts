import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getActiveCommand} from '../active-command.js'
import {isStringWithValue} from './validators.js'

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`

type DotNestedKeys<T> = (T extends Record<string, any> ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : '') extends infer D ? Extract<D, string> : never;

export interface Prompt<T extends Record<string, any>> {
  propName: DotNestedKeys<T> | DotNestedKeys<T>[];
  run: (data: Partial<T>) => Promise<any>;
  validate: (data: Partial<T>) => string | undefined | null | boolean;
  runIf?: (data: Partial<T>) => boolean;
}

function setNestedProperty(obj: any, path: string, value: any): any {
  const keys = path.split('.')
  let currentObj = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    // eslint-disable-next-line no-prototype-builtins
    if (!currentObj.hasOwnProperty(key)) {
      currentObj[key] = {}
    }

    currentObj = currentObj[key]
  }

  currentObj[keys[keys.length - 1]] = value
  return obj
}

function getValue(obj: any, path: string): any {
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    // eslint-disable-next-line no-prototype-builtins
    if (!value || !value.hasOwnProperty(key)) {
      return null
    }

    value = value[key]
  }

  return value
}

const isValueProvided = (value: any): boolean => typeof value  !== 'undefined' && value !== null && value !== ''

export interface PromptsWizardOptions<T extends Record<string, any>> {
    prompts: Prompt<T>[];
    validateAnswers: (data: any) => string | boolean;
  }

export class PromptsWizard {
  static async run<T extends Record<string, any>>(data: Partial<T>, options: PromptsWizardOptions<T>): Promise<T> {
    const {log, debug} = getActiveCommand()

    let activeIndex = 0
    do {
      debug(`Running prompt ${activeIndex} of ${options.prompts.length - 1}`)
      const activePrompt = options.prompts[activeIndex]
      const propNameOrNames: string | string[] = activePrompt.propName

      const hasValues = Array.isArray(propNameOrNames) ? propNameOrNames.every(p => isValueProvided(getValue(data, p as string))) : isValueProvided(getValue(data, propNameOrNames as string))

      if (!hasValues && (!activePrompt.runIf || activePrompt.runIf(data))) {
        // eslint-disable-next-line no-await-in-loop
        const propValue = await activePrompt.run(data as T)
        if (propValue || typeof propValue === 'boolean') {
          if (Array.isArray(propNameOrNames)) {
            // eslint-disable-next-line max-depth
            for (const [i, propName] of propNameOrNames.entries()) {
              setNestedProperty(data, propName, propValue[i])
            }
          } else {
            setNestedProperty(data, propNameOrNames, propValue)
          }

          // eslint-disable-next-line no-await-in-loop
          const promptValidation = await activePrompt.validate(data as T)

          debug({
            data,
            propName: propNameOrNames,
            promptValidateStatus: promptValidation,
          })

          if (promptValidation === false || isStringWithValue(promptValidation)) {
            throw new CLIError(isStringWithValue(promptValidation) ? promptValidation : 'Invalid answers provided')
          }

          activeIndex++
        } else {
          log('No answer provided, aborting')
          // eslint-disable-next-line no-process-exit, unicorn/no-process-exit
          process.exit(0)
        }
      } else {
        activeIndex++
      }
    } while (activeIndex < options.prompts.length)

    debug('All prompts completed, validating answers')
    debug(data)
    const validationStatus = options.validateAnswers(data)

    if (validationStatus === false || isStringWithValue(validationStatus)) {
      throw new CLIError(isStringWithValue(validationStatus) ? validationStatus : 'Invalid answers provided')
    }

    debug('All answers validated')
    return data as T
  }
}

