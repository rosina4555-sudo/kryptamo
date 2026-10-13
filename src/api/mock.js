import { ApiError } from './errors'
import { TRANSFER_STATES } from './states'
import { corridorRate, countryCodeForCurrency } from '../data/countries'

let latency = 350
let flow = { first: 1600, step: 1400 }
let gateways = 0

export function setMockLatency(ms) {
  latency = ms
}

export function setMockFlow(next) {
  flow = { ...flow, ...next }
}

const DAILY_LIMIT = 5_000_000

const wait = () => new Promise((resolve) => setTimeout(resolve, latency))
const nowIso = () => new Date().toISOString()
const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

const stateMessages = {
  FUNDING_PENDING: 'Waiting for your Mobile Money payment to clear.',
  FUNDED: 'Payment received.',
  ONRAMP_EXECUTING: 'Preparing your transfer.',
  ONCHAIN_TRANSFER: 'Routing funds.',
  OFFRAMP_EXECUTING: 'Converting to their local currency.',
  PAYOUT_INITIATED: 'Sending to Mobile Money.',
  PAID_OUT: 'Delivered.',
  FAILED: "This transfer didn't go through.",
}

const recipients = {
  kwame: {
    username: 'kwame',
    recipient_id: 'usr_448120',
    country: 'GH',
    currency: 'GHS',
    phone_number_masked: '+233 24 **** 567',
    momo_details: { network: 'MTN', account_name: 'KWAME A. MENSAH' },
  },
  ama: {
    username: 'ama',
    recipient_id: 'usr_448221',
    country: 'GH',
    currency: 'GHS',
    phone_number_masked: '+233 20 **** 314',
    momo_details: { network: 'Telecel', account_name: 'AMA OWUSU' },
  },
  kofi: {
    username: 'kofi',
    recipient_id: 'usr_448333',
    country: 'GH',
    currency: 'GHS',
    phone_number_masked: '+233 27 **** 908',
    momo_details: { network: 'AirtelTigo', account_name: 'KOFI BOATENG' },
  },
  wanjiru: {
    username: 'wanjiru',
    recipient_id: 'usr_448410',
    country: 'KE',
    currency: 'KES',
    phone_number_masked: '+254 71 **** 204',
    momo_details: { network: 'M-Pesa', account_name: 'WANJIRU KAMAU' },
  },
  chidi: {
    username: 'chidi',
    recipient_id: 'usr_448512',
    country: 'NG',
    currency: 'NGN',
    phone_number_masked: '+234 80 **** 771',
    momo_details: { network: 'MTN MoMo', account_name: 'CHIDI OKAFOR' },
  },
  aissatou: {
    username: 'aissatou',
    recipient_id: 'usr_448620',
    country: 'SN',
    currency: 'XOF',
    phone_number_masked: '+221 77 **** 502',
    momo_details: { network: 'Orange Money', account_name: 'AISSATOU DIALLO' },
  },
  jamal: {
    username: 'jamal',
    recipient_id: 'usr_448711',
    country: 'UG',
    currency: 'UGX',
    phone_number_masked: '+256 77 **** 318',
    momo_details: { network: 'MTN MoMo', account_name: 'JAMAL OKOT' },
  },
  marie: {
    username: 'marie',
    recipient_id: 'usr_448802',
    country: 'CM',
    currency: 'XAF',
    phone_number_masked: '+237 67 **** 190',
    momo_details: { network: 'Orange Money', account_name: 'MARIE NGANOU' },
  },
}

const inactiveWallets = new Set(['yaw'])

const users = new Map()
const tokens = new Map()
const quotes = new Map()
const transfers = new Map()
const subscribers = new Map()
const idempotency = new Map()

function seedUser(user) {
  users.set(user.username, user)
}

seedUser({
  id: 'usr_991823',
  username: 'oliver',
  email: 'oliver@example.com',
  phone_number: '+254712345678',
  password: 'SecurePassword123!',
  kyc_status: 'VERIFIED',
})

function makeTransfer({ id, status, recipient, sendAmount, sourceCurrency, sourceCountry, createdAt }) {
  const targetCurrency = recipient.currency
  const rate = corridorRate(sourceCurrency, targetCurrency)
  const recipientGets = (Number(sendAmount) * rate).toFixed(2)
  return {
    transfer_id: id,
    type: 'SENT',
    quote_id: makeId('qte'),
    counterparty_handle: `@${recipient.username}`,
    counterparty_name: recipient.momo_details.account_name,
    network: recipient.momo_details.network,
    recipient_country: recipient.country,
    source_country: sourceCountry ?? countryCodeForCurrency(sourceCurrency),
    send_amount: Number(sendAmount).toFixed(2),
    source_currency: sourceCurrency,
    recipient_gets: recipientGets,
    target_currency: targetCurrency,
    fx_rate: rate.toFixed(6),
    platform_fee: '0.00',
    network_fee: '0.00',
    total_payable: Number(sendAmount).toFixed(2),
    status,
    created_at: createdAt,
    updated_at: createdAt,
  }
}

transfers.set(
  'txn_8832920192',
  makeTransfer({
    id: 'txn_8832920192',
    status: 'PAID_OUT',
    recipient: recipients.kwame,
    sendAmount: 25000,
    sourceCurrency: 'NGN',
    sourceCountry: 'NG',
    createdAt: '2026-10-11T14:35:41Z',
  }),
)
transfers.set(
  'txn_8832920120',
  makeTransfer({
    id: 'txn_8832920120',
    status: 'PAID_OUT',
    recipient: recipients.wanjiru,
    sendAmount: 3000,
    sourceCurrency: 'GHS',
    sourceCountry: 'GH',
    createdAt: '2026-10-10T16:40:00Z',
  }),
)
transfers.set(
  'txn_8832920100',
  makeTransfer({
    id: 'txn_8832920100',
    status: 'PAID_OUT',
    recipient: recipients.wanjiru,
    sendAmount: 10000,
    sourceCurrency: 'XOF',
    sourceCountry: 'SN',
    createdAt: '2026-10-09T11:05:00Z',
  }),
)
transfers.set(
  'txn_8832920055',
  makeTransfer({
    id: 'txn_8832920055',
    status: 'PAYOUT_INITIATED',
    recipient: recipients.ama,
    sendAmount: 5000,
    sourceCurrency: 'KES',
    sourceCountry: 'KE',
    createdAt: '2026-10-08T09:20:00Z',
  }),
)
transfers.set(
  'txn_8832920044',
  makeTransfer({
    id: 'txn_8832920044',
    status: 'FAILED',
    recipient: recipients.kwame,
    sendAmount: 20000,
    sourceCurrency: 'NGN',
    sourceCountry: 'NG',
    createdAt: '2026-10-05T11:20:00Z',
  }),
)

function emit(transfer) {
  const payload = {
    transfer_id: transfer.transfer_id,
    current_state: transfer.status,
    message: stateMessages[transfer.status] ?? 'In progress.',
    updated_at: transfer.updated_at,
  }
  subscribers.get(transfer.transfer_id)?.forEach((handler) => handler(payload))
}

function scheduleProgression(transfer) {
  let index = TRANSFER_STATES.indexOf(transfer.status)
  const tick = () => {
    if (index >= TRANSFER_STATES.length - 1) return
    index += 1
    transfer.status = TRANSFER_STATES[index]
    transfer.updated_at = nowIso()
    emit(transfer)
    if (index < TRANSFER_STATES.length - 1) setTimeout(tick, flow.step)
  }
  setTimeout(tick, flow.first)
}

export function mockSubscribe(transferId, handler) {
  if (!subscribers.has(transferId)) subscribers.set(transferId, new Set())
  subscribers.get(transferId).add(handler)
  const transfer = transfers.get(transferId)
  if (transfer) {
    handler({
      transfer_id: transferId,
      current_state: transfer.status,
      message: stateMessages[transfer.status] ?? 'In progress.',
      updated_at: transfer.updated_at,
    })
  }
  return () => subscribers.get(transferId)?.delete(handler)
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone_number: user.phone_number,
    kyc_status: user.kyc_status,
  }
}

function issueToken(user) {
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(user.username)}.${makeId('sig')}`
  tokens.set(token, user.username)
  return token
}

function findUser(identifier) {
  const value = String(identifier ?? '').toLowerCase()
  for (const user of users.values()) {
    if (user.username.toLowerCase() === value || user.email.toLowerCase() === value) return user
  }
  return null
}

const e164 = /^\+[1-9]\d{7,14}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernamePattern = /^[a-zA-Z0-9]+$/

export async function mockRequest({ method, path, body = {}, query = {} }) {
  await wait()

  if (method === 'POST' && path === '/auth/signup') {
    const details = {}
    if (!usernamePattern.test(body.username ?? '')) details.username = 'Usernames use letters and numbers only.'
    if (!e164.test(body.phone_number ?? '')) details.phone_number = 'Enter a valid Mobile Money number in E.164 format.'
    if (!emailPattern.test(body.email ?? '')) details.email = 'Enter a valid email address.'
    if ((body.password ?? '').length < 8) details.password = 'Passwords are at least 8 characters.'
    if (Object.keys(details).length) throw new ApiError({ error_code: 'VALIDATION_ERROR', details })
    if (users.has(body.username)) throw new ApiError({ error_code: 'USERNAME_TAKEN' })
    if (findUser(body.email)) throw new ApiError({ error_code: 'VALIDATION_ERROR', message: 'Email already registered.' })
    const user = {
      id: makeId('usr'),
      username: body.username,
      email: body.email,
      phone_number: body.phone_number,
      password: body.password,
      kyc_status: 'VERIFIED',
    }
    users.set(user.username, user)
    return { access_token: issueToken(user), user: publicUser(user) }
  }

  if (method === 'POST' && path === '/auth/login') {
    const user = findUser(body.email_or_username)
    if (!user || user.password !== body.password) throw new ApiError({ error_code: 'INVALID_CREDENTIALS' })
    return { access_token: issueToken(user), user: publicUser(user) }
  }

  if (method === 'GET' && path === '/users/lookup') {
    const username = String(query.username ?? '').toLowerCase().replace(/^@/, '')
    if (inactiveWallets.has(username)) throw new ApiError({ error_code: 'MOMO_LOOKUP_FAILED' })
    const recipient = recipients[username]
    if (!recipient) throw new ApiError({ error_code: 'USER_NOT_FOUND' })
    return recipient
  }

  if (method === 'POST' && path === '/quotes') {
    const recipient = recipients[String(body.recipient_username ?? '').toLowerCase()]
    if (!recipient) throw new ApiError({ error_code: 'USER_NOT_FOUND' })
    const sourceCurrency = String(body.source_currency ?? '').toUpperCase()
    if (!sourceCurrency) throw new ApiError({ error_code: 'QUOTE_EXPIRED', message: 'Start again with a quote.' })
    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ApiError({ error_code: 'VALIDATION_ERROR', details: { amount: 'Enter an amount greater than zero.' } })
    }
    if (amount > DAILY_LIMIT) throw new ApiError({ error_code: 'LIMIT_EXCEEDED' })
    const rate = corridorRate(sourceCurrency, recipient.currency)
    const quote = {
      quote_id: makeId('qte'),
      send_amount: amount.toFixed(2),
      source_currency: sourceCurrency,
      source_country: body.source_country ?? countryCodeForCurrency(sourceCurrency),
      target_currency: recipient.currency,
      recipient_gets: (amount * rate).toFixed(2),
      fx_rate: rate.toFixed(6),
      platform_fee: '0.00',
      network_fee: '0.00',
      total_payable: amount.toFixed(2),
      recipient_username: recipient.username,
      expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    }
    quotes.set(quote.quote_id, quote)
    return quote
  }

  if (method === 'POST' && path === '/transfers') {
    if (body.idempotency_key && idempotency.has(body.idempotency_key)) {
      return transfers.get(idempotency.get(body.idempotency_key))
    }
    const quote = quotes.get(body.quote_id)
    if (!quote) throw new ApiError({ error_code: 'QUOTE_EXPIRED' })
    if (new Date(quote.expires_at).getTime() < Date.now()) throw new ApiError({ error_code: 'QUOTE_EXPIRED' })
    const recipient = recipients[quote.recipient_username] ?? Object.values(recipients)[0]
    const transfer = {
      ...makeTransfer({
        id: makeId('txn'),
        status: 'FUNDING_PENDING',
        recipient,
        sendAmount: quote.send_amount,
        sourceCurrency: quote.source_currency,
        sourceCountry: quote.source_country,
        createdAt: nowIso(),
      }),
      quote_id: quote.quote_id,
      fx_rate: quote.fx_rate,
      recipient_gets: quote.recipient_gets,
      total_payable: quote.total_payable,
      payment_gateway_url: `https://checkout.honeycoin.app/pay/checkout_${++gateways}`,
    }
    transfers.set(transfer.transfer_id, transfer)
    if (body.idempotency_key) idempotency.set(body.idempotency_key, transfer.transfer_id)
    scheduleProgression(transfer)
    return {
      transfer_id: transfer.transfer_id,
      status: transfer.status,
      payment_gateway_url: transfer.payment_gateway_url,
      created_at: transfer.created_at,
    }
  }

  if (method === 'GET' && path === '/transfers') {
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)
    const all = [...transfers.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    const start = (page - 1) * limit
    return {
      transfers: all.slice(start, start + limit),
      page,
      limit,
      total: all.length,
      total_pages: Math.max(1, Math.ceil(all.length / limit)),
    }
  }

  const detail = path.match(/^\/transfers\/([^/]+)$/)
  if (method === 'GET' && detail) {
    const transfer = transfers.get(detail[1])
    if (!transfer) throw new ApiError({ error_code: 'NOT_FOUND', message: 'Transfer not found.' })
    return transfer
  }

  throw new ApiError({ error_code: 'NOT_FOUND', message: `No mock route for ${method} ${path}.` })
}

export function resetMock() {
  quotes.clear()
  subscribers.clear()
  idempotency.clear()
  gateways = 0
  for (const id of [...transfers.keys()]) {
    if (
      ![
        'txn_8832920192',
        'txn_8832920120',
        'txn_8832920100',
        'txn_8832920055',
        'txn_8832920044',
      ].includes(id)
    ) {
      transfers.delete(id)
    }
  }
}
