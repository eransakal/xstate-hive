
import {PrettyPrintableError} from '@oclif/core/lib/interfaces'

export interface Logger {
    exit(code?: number): void;
    warn(input: string | Error): string | Error;
    error(input: string | Error, options: {
        code?: string;
        exit: false;
    } & PrettyPrintableError): void;
    error(input: string | Error, options?: {
        code?: string;
        exit?: number;
    } & PrettyPrintableError): never;
    log(message?: string, ...args: any[]): void;
}

let _logger: Logger

export const setCommandLogger = (logger: Logger): void => {
  _logger = logger
}

export const getCommandLogger = (): Logger => _logger
