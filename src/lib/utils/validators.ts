
export const isStringWithValue = (value?: any): value is string => value && typeof value === 'string' && Boolean(value)
