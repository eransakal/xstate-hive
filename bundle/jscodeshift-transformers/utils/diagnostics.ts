import fs from 'fs'

function duplicateAndStripLoc(obj: Record<string, any>): Record<string, any> {
  const duplicatedObj: Record<string, any> = {}

  try {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (prop === 'loc') {
          continue // Skip the "loc" property
        }

        const value = obj[prop]
        if (typeof value === 'object' && value !== null) {
          duplicatedObj[prop] = duplicateAndStripLoc(value) // Recursively process nested objects
        } else {
          duplicatedObj[prop] = value
        }
      }
    }

    return duplicatedObj
  } catch {
    return {failed: true}
  }
}

export function saveDiagnostic(path: string, raw: any) {
  const content = duplicateAndStripLoc(raw)
  fs.writeFileSync(path, JSON.stringify(content, null, 2))
}
