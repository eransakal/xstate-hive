export function toLowerCamelCase(input: string): string {
  const words = input.split(/[^\dA-Za-z]/)
  const lowerCamelCaseWords = words.map((word, index) => {
    if (index === 0) {
      return word.charAt(0).toLowerCase() + word.slice(1)
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  return lowerCamelCaseWords.join('')
}

export function toPascalCase(input: string): string {
  const words = input.split(/[\s-]/)
  const pascalCaseWords = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  return pascalCaseWords.join('')
}

export function toDashCase(input: string): string {
  const dashCase = input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  return dashCase
}
