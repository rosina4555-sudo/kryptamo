const symbols = {
  USD: '$',
  CAD: 'C$',
  GBP: '£',
  EUR: '€',
  GHS: 'GH₵',
  NGN: '₦',
  KES: 'KSh',
  UGX: 'USh',
  TZS: 'TSh',
  RWF: 'FRw',
  ZMW: 'ZK',
  XOF: 'CFA',
  XAF: 'FCFA',
  MWK: 'MK',
  MZN: 'MT',
  ETB: 'Br',
  CDF: 'FC',
  SLE: 'Le',
  LRD: 'L$',
}

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

export function formatRate(rate) {
  const value = Number(rate)
  if (!Number.isFinite(value) || value === 0) return '0'
  return String(Number(value.toPrecision(4)))
}

export function currencySymbol(currency) {
  return symbols[String(currency ?? '').toUpperCase()] ?? currency
}

export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
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