const symbols = { USD: '$', GHS: 'GH₵' }

export function formatMoney(amount, currency, options = {}) {
  const { showCode = false } = options
  const value = Number(amount).toFixed(2)
  const [int, dec] = value.split('.')
  const grouped = new Intl.NumberFormat('en-US').format(Number(int))
  const symbol = symbols[currency] ?? currency
  const formatted = `${symbol}${grouped}.${dec}`
  return showCode ? `${formatted} ${currency}` : formatted
}

export function formatAmount(amount, currency) {
  return `${formatMoney(amount, currency)} ${currency}`
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function maskPhone(phone) {
  const stripped = phone.replace(/[^\d+]/g, '')
  const chunks = stripped.match(/\d+/g)?.join('') ?? ''
  if (chunks.length < 5) return phone
  const code = chunks.slice(0, 3)
  const firstTwo = chunks.slice(3, 5)
  const lastThree = chunks.slice(-3)
  return `+${code} ${firstTwo} **** ${lastThree}`
}