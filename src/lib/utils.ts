export function toCamelCase(input: string): string {
  let words: string[]
  if (input.includes('-')) {
    words = input.split('-')
  } else if (/[a-z][A-Z]/.test(input)) {
    words = input.split(/(?=[A-Z])/)
  } else {
    words = [input]
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
  if (input.includes('-')) {
    words = input.split('-')
  } else if (/[a-z][A-Z]/.test(input)) {
    words = input.split(/(?=[A-Z])/)
  } else {
    words = [input]
  }

  const pascalCaseWords = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return pascalCaseWords.join('')
}

export function toDashCase(input: string): string {
  let words: string[]
  if (input.includes('-')) {
    words = input.split('-')
  } else if (/[a-z][A-Z]/.test(input)) {
    words = input.split(/(?=[A-Z])/)
  } else {
    words = [input]
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

export const formatMachineName = (name: string) => {
  const result = (name || '').trim()
  if (!result) {
    return ''
  }

  return  toCamelCase(result).endsWith('Machine') ? toCamelCase(result).slice(0, -7)  : toCamelCase(result)
}
