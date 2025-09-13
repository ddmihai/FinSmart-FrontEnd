export function parsePoundsToPence(input: string): number | null {
  if (typeof input !== 'string' || input.trim() === '') return null
  const n = Number(input)
  if (!Number.isFinite(n) || n <= 0) return null
  const pence = Math.round(n * 100)
  return pence > 0 ? pence : null
}

export function formatPenceToPounds(pence: number): string {
  return (pence / 100).toFixed(2)
}

