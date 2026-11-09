export function parseRupeesToPaise(raw: string): number | null {
  const value = raw.trim()
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null
  const [rupees = '', paise = ''] = value.split('.')
  const cents = BigInt(rupees) * 100n + BigInt(paise.padEnd(2, '0'))
  return cents > 0n && cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) : null
}

export function formatINR(cents: number): string {
  const negative = cents < 0
  const absolute = BigInt(Math.abs(cents))
  const rupees = absolute / 100n
  const paise = String(absolute % 100n).padStart(2, '0')
  const formattedRupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
    Number(rupees),
  )
  return `${negative ? '-' : ''}₹${formattedRupees}.${paise}`
}
