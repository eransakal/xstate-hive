import {toLowerCamelCase} from '../utils.js'

export const formatMachineName = (name: string) => {
  const result = (name || '').trim()
  if (!result) {
    return ''
  }

  return  toLowerCamelCase(result).endsWith('Machine') ? toLowerCamelCase(result).slice(0, -7)  : toLowerCamelCase(result)
}
