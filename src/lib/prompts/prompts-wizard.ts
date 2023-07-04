import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getActiveCommand} from '../active-command.js'
import {isStringWithValue} from '../utils/validators.js'

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${'' extends P ? '' : '.'}${P}`
    : never : never;

    type Paths<T, D extends number = 10> = [D] extends [never] ? never : T extends Record<string, any> ?
    { [K in keyof T]-?: K extends string | number ?
        `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T] : ''

type Prev = [never, 0, 1, 2, 3, ...0[]]

export interface Prompt<T extends Record<string, any>> {
  propName: Paths<T> | (Paths<T>[]);
  run: (data: Partial<T>) => Promise<any>;
  allowEmptyAnswer?: boolean;
  validate: (data: Partial<T>) => string | undefined | null | boolean;
  postPrompt?: (data: Partial<T>) => Promise<void>;
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
      const activePrompt = options.prompts[activeIndex]

      debug(`Running prompt ${activeIndex + 1} of ${options.prompts.length} (${activePrompt.propName})`)
      const propNameOrNames: string | string[] = activePrompt.propName

      const hasValues = Array.isArray(propNameOrNames) ? propNameOrNames.every(p => isValueProvided(getValue(data, p as string))) : isValueProvided(getValue(data, propNameOrNames as string))

      if (!hasValues && (!activePrompt.runIf || activePrompt.runIf(data))) {
        // eslint-disable-next-line no-await-in-loop
        const propValue = await activePrompt.run(data as T)

        if (activePrompt.allowEmptyAnswer || propValue || typeof propValue === 'boolean') {
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
            propName: propNameOrNames,
            propValue,
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

      if (activePrompt.postPrompt) {
        debug('run post prompt')
        // eslint-disable-next-line no-await-in-loop
        await activePrompt.postPrompt(data)
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

