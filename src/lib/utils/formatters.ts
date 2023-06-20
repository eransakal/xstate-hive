export function toCamelCase(input: string): string {
  let words: string[]
  const resolvedInput = (input || '').trim().replace('-', ' ').replace('/[ ]{2,}/g', ' ').replace(/-^/, '')
  if (resolvedInput.includes(' ')) {
    words = resolvedInput.split(' ')
  }  else if (/[a-z][A-Z]/.test(input)) {
    words = resolvedInput.split(/(?=[A-Z])/)
  } else {
    words = [resolvedInput]
  }

  const camelCaseWords = words.map((word, index) => {
    if (index === 0) {
      return word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return camelCaseWords.join('')
}

export function toPascalCase(input: string): string {
  let words: string[]
  const resolvedInput = (input || '').trim().replace('-', ' ').replace('/[ ]{2,}/g', ' ').replace(/-^/, '')
  if (input.includes(' ')) {
    words = resolvedInput.split(' ')
  } else if (/[a-z][A-Z]/.test(input)) {
    words = resolvedInput.split(/(?=[A-Z])/)
  } else {
    words = [resolvedInput]
  }

  const pascalCaseWords = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return pascalCaseWords.join('')
}

export function toDashCase(input: string): string {
  let words: string[]
  const resolvedInput = (input || '').trim().replace('-', ' ').replace('/[ ]{2,}/g', ' ').replace(/-^/, '')
  if (resolvedInput.includes(' ')) {
    words = resolvedInput.split(' ')
  } else if (/[a-z][A-Z]/.test(input)) {
    words = resolvedInput.split(/(?=[A-Z])/)
  } else {
    words = [resolvedInput]
  }

  const dashCaseWords = words.map(word => word.toLowerCase())

  return dashCaseWords.join('-')
}

export function formatStateName(stateName: string): string {
  const resolvedStateName = (stateName || '').trim()
  if (!resolvedStateName) {
    return ''
  }

  return  toCamelCase(resolvedStateName).endsWith('State') ? toCamelCase(resolvedStateName).slice(0, -5)  : toCamelCase(resolvedStateName)
}

export const formatMachineName = (name?: string) => {
  const result = (name || '').trim()
  if (!result) {
    return ''
  }

  return  toCamelCase(result).endsWith('Machine') ? toCamelCase(result).slice(0, -7)  : toCamelCase(result)
}
