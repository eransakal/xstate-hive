
export interface CreateMachineOptions {
  machineName: string,
  machinePath: string,
}

export function validateCreateMachineOptions(options: any): string | boolean {
  if (typeof options.machineName !== 'string' || !options.machineName) {
    return 'Machine name is required'
  }

  if (typeof options.machinePath !== 'string' || !options.machinePath) {
    return 'Machine path is required'
  }

  return true
}
