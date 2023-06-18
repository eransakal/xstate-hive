import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getActiveCommand} from '../active-command.js'

export interface Prompt<T, K extends keyof T> {
  propName: K;
  run: (data: Partial<T>) => Promise<T[K]>;
  validate: (data: Partial<T>) => string | undefined | null | boolean;
  runIf?: (data: Partial<T>) => boolean;
}

export interface PromptsWizardOptions<T> {
    prompts: Prompt<T, keyof T>[];
    validateAnswers: (data: any) => data is T;
  }

export class PromptsWizard {
  static async run<T>(options: PromptsWizardOptions<T>): Promise<T> {
    const {log, debug} = getActiveCommand()

    let data: Partial<T> = {} as T
    let activeIndex = 0
    do {
      debug(`Running prompt ${activeIndex} of ${options.prompts.length - 1}`)
      const activePrompt = options.prompts[activeIndex]
      const propName = activePrompt.propName
      if (!activePrompt.runIf || activePrompt.runIf(data)) {
        // eslint-disable-next-line no-await-in-loop
        const propValue = await activePrompt.run(data as T)
        if (propValue || typeof propValue === 'boolean') {
          data = {...data, [propName]: propValue}
          // eslint-disable-next-line no-await-in-loop
          const maybeError = await activePrompt.validate(data as T)

          debug({
            propName,
            propValue,
            maybeError,
          })

          if (maybeError !== true && maybeError) {
            throw new CLIError(maybeError)
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
    options.validateAnswers(data)

    debug('All answers validated')
    return data as T
  }
}

