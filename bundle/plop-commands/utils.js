export function toCamelCase(input) {
  let words
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

export function toPascalCase(input) {
  let words
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

export function toDashCase(input) {
  let words
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

