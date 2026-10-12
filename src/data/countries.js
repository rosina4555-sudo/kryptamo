// Launch network list for pan-African Mobile Money transfers.
// `perGhs` is a display-only placeholder for the units of each currency per 1 GHS.
// The backend is the source of truth for the finally supported country set and rates.

export const COUNTRIES = [
  {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    dial: '233',
    networks: ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'],
    perGhs: 1,
  },
  {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    dial: '234',
    networks: ['MTN MoMo', 'Airtel Money', 'OPay'],
    perGhs: 160,
  },
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    dial: '254',
    networks: ['M-Pesa', 'Airtel Money'],
    perGhs: 11,
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    dial: '256',
    networks: ['MTN MoMo', 'Airtel Money'],
    perGhs: 300,
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    dial: '255',
    networks: ['M-Pesa', 'Airtel Money', 'Mixx by Yas'],
    perGhs: 200,
  },
  {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    dial: '250',
    networks: ['MTN MoMo', 'Airtel Money'],
    perGhs: 105,
  },
  {
    code: 'ZM',
    name: 'Zambia',
    currency: 'ZMW',
    dial: '260',
    networks: ['MTN MoMo', 'Airtel Money', 'Zamtel Kwacha'],
    perGhs: 1.7,
  },
  {
    code: 'CI',
    name: 'Côte d’Ivoire',
    currency: 'XOF',
    dial: '225',
    networks: ['Orange Money', 'MTN MoMo', 'Moov Money', 'Wave'],
    perGhs: 39,
  },
  {
    code: 'SN',
    name: 'Senegal',
    currency: 'XOF',
    dial: '221',
    networks: ['Orange Money', 'Wave', 'Free Money'],
    perGhs: 39,
  },
  {
    code: 'CM',
    name: 'Cameroon',
    currency: 'XAF',
    dial: '237',
    networks: ['MTN MoMo', 'Orange Money'],
    perGhs: 39,
  },
  {
    code: 'BJ',
    name: 'Benin',
    currency: 'XOF',
    dial: '229',
    networks: ['MTN MoMo', 'Moov Money', 'Celtiis Cash'],
    perGhs: 39,
  },
  {
    code: 'TG',
    name: 'Togo',
    currency: 'XOF',
    dial: '228',
    networks: ['T-Money', 'Moov Money'],
    perGhs: 39,
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    currency: 'XOF',
    dial: '226',
    networks: ['Orange Money', 'Moov Money'],
    perGhs: 39,
  },
  {
    code: 'ML',
    name: 'Mali',
    currency: 'XOF',
    dial: '223',
    networks: ['Orange Money', 'Moov Money'],
    perGhs: 39,
  },
  {
    code: 'MW',
    name: 'Malawi',
    currency: 'MWK',
    dial: '265',
    networks: ['Airtel Money', 'TNM Mpamba'],
    perGhs: 112,
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    currency: 'MZN',
    dial: '258',
    networks: ['M-Pesa', 'e-Mola'],
    perGhs: 4.1,
  },
  {
    code: 'ET',
    name: 'Ethiopia',
    currency: 'ETB',
    dial: '251',
    networks: ['Telebirr', 'M-Pesa'],
    perGhs: 12,
  },
  {
    code: 'CD',
    name: 'DR Congo',
    currency: 'CDF',
    dial: '243',
    networks: ['M-Pesa', 'Orange Money', 'Airtel Money'],
    perGhs: 180,
  },
  {
    code: 'SL',
    name: 'Sierra Leone',
    currency: 'SLE',
    dial: '232',
    networks: ['Orange Money', 'Afrimoney'],
    perGhs: 1.45,
  },
  {
    code: 'LR',
    name: 'Liberia',
    currency: 'LRD',
    dial: '231',
    networks: ['MTN MoMo', 'Orange Money'],
    perGhs: 12,
  },
]

export const SEND_COUNTRY_CODES = ['NG', 'KE', 'CI', 'SN', 'CM', 'UG']

const byCode = new Map(COUNTRIES.map((country) => [country.code, country]))

const perGhsByCurrency = new Map()
const codeByCurrency = new Map()
for (const country of COUNTRIES) {
  if (!perGhsByCurrency.has(country.currency)) perGhsByCurrency.set(country.currency, country.perGhs)
  if (!codeByCurrency.has(country.currency)) codeByCurrency.set(country.currency, country.code)
}

export function countryByCode(code) {
  return byCode.get(String(code ?? '').toUpperCase()) ?? null
}

export function countryCodeForCurrency(currency) {
  return codeByCurrency.get(String(currency ?? '').toUpperCase()) ?? null
}

export function sendCountries() {
  return SEND_COUNTRY_CODES.map(countryByCode).filter(Boolean)
}

export function perGhs(currency) {
  return perGhsByCurrency.get(String(currency ?? '').toUpperCase()) ?? 1
}

export function corridorRate(sourceCurrency, targetCurrency) {
  return perGhs(targetCurrency) / perGhs(sourceCurrency)
}

export function emojiFlag(code) {
  return String(code ?? '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}
