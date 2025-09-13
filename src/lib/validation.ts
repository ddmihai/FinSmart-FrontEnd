export function isValidSortCode(v: string): boolean {
  return /^\d{2}-\d{2}-\d{2}$/.test(v.trim())
}

export function isValidAccountNumber(v: string): boolean {
  return /^\d{8}$/.test(v.trim())
}

export function required(v: string, min = 1): boolean {
  return typeof v === 'string' && v.trim().length >= min
}

