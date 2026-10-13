const NETWORK_LOGOS = {
  MTN: '/momo/mtn.png',
  'MTN Mobile Money': '/momo/mtn.png',
  'MTN MoMo': '/momo/mtn.png',
  Telecel: '/momo/telecel.png',
  'Telecel Cash': '/momo/telecel.png',
  AirtelTigo: '/momo/airteltigo.png',
  'AirtelTigo Money': '/momo/airteltigo.png',
}

const NETWORK_COLORS = {
  'M-Pesa': '#E60000',
  'Airtel Money': '#E4002B',
  OPay: '#1DCF9F',
  'Orange Money': '#FF7900',
  'Moov Money': '#0B4EA2',
  'Mixx by Yas': '#00A9E0',
  'Zamtel Kwacha': '#F4A21A',
  'TNM Mpamba': '#00A651',
  'e-Mola': '#E4002B',
  Telebirr: '#7AC143',
  Afrimoney: '#F58220',
  'Celtiis Cash': '#00A9CE',
  'T-Money': '#F4A21A',
}

export function networkLogo(network) {
  return NETWORK_LOGOS[network] ?? null
}

export function networkInitials(network) {
  const parts = String(network ?? '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function networkColor(network) {
  return NETWORK_COLORS[network] ?? 'var(--color-volta)'
}
