const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function parseDollarsToCents(raw: string): number | null {
  const value = raw.trim()
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null

  const [dollars = '', cents = ''] = value.split('.')
  const totalCents = BigInt(dollars) * 100n + BigInt(cents.padEnd(2, '0'))

  if (totalCents <= 0n || totalCents > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return Number(totalCents)
}

export function formatUSDCents(cents: number | bigint): string {
  const value =
    typeof cents === 'bigint' ? cents : Number.isSafeInteger(cents) ? BigInt(cents) : null
  if (value === null) return '—'

  const negative = value < 0n
  const absolute = negative ? -value : value
  const wholeDollars = absolute / 100n
  const fraction = String(absolute % 100n).padStart(2, '0')
  const formatted = usdFormatter
    .formatToParts(wholeDollars)
    .map((part) => (part.type === 'fraction' ? fraction : part.value))
    .join('')

  return negative ? `-${formatted}` : formatted
}
