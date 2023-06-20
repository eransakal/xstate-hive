import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getActiveCommand} from '../active-command.js'
import {isStringWithValue} from './validators.js'

type NestedKeyOf<ObjectType extends Record<string, any>> =
{[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends Record<string, any>
? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
: `${Key}`
}[keyof ObjectType & (string | number)];

export interface Prompt<T extends Record<string, any>> {
  propName: NestedKeyOf<T> | NestedKeyOf<T>[];
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

function getNestedProperty(obj: any, path: string): any {
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
      const propName = activePrompt.propName
      const propValue = getNestedProperty(data, propName as string)

      if (propValue === null && (!activePrompt.runIf || activePrompt.runIf(data))) {
        // eslint-disable-next-line no-await-in-loop
        const propValue = await activePrompt.run(data as T)
        if (propValue || typeof propValue === 'boolean') {
          setNestedProperty(data, propName as string, propValue)
          // eslint-disable-next-line no-await-in-loop
          const promptValidation = await activePrompt.validate(data as T)

          debug({
            propName,
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

