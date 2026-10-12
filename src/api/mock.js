import { ApiError } from './errors'
import { TRANSFER_STATES } from './states'

let latency = 350
let flow = { first: 1600, step: 1400 }
let gateways = 0

export function setMockLatency(ms) {
  latency = ms
}

export function setMockFlow(next) {
  flow = { ...flow, ...next }
}

const wait = () => new Promise((resolve) => setTimeout(resolve, latency))
const nowIso = () => new Date().toISOString()
const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

const stateMessages = {
  FUNDING_PENDING: 'Waiting for your payment to clear.',
  FUNDED: 'Payment received.',
  ONRAMP_EXECUTING: 'Preparing your transfer.',
  ONCHAIN_TRANSFER: 'Routing funds.',
  OFFRAMP_EXECUTING: 'Converting to cedis.',
  PAYOUT_INITIATED: 'Sending to Mobile Money.',
  PAID_OUT: 'Delivered.',
  FAILED: "This transfer didn't go through.",
}

const corridors = {
  USD: { rate: 15.6, platform: 1.5, network: 0.5 },
  CAD: { rate: 11.4, platform: 2.0, network: 0.75 },
  GBP: { rate: 19.8, platform: 1.2, network: 0.4 },
}

const recipients = {
  kwame: {
    username: 'kwame',
    recipient_id: 'usr_448120',
    phone_number_masked: '+233 24 **** 567',
    momo_details: { network: 'MTN', account_name: 'KWAME A. MENSAH' },
  },
  ama: {
    username: 'ama',
    recipient_id: 'usr_448221',
    phone_number_masked: '+233 20 **** 314',
    momo_details: { network: 'Telecel', account_name: 'AMA OWUSU' },
  },
  kofi: {
    username: 'kofi',
    recipient_id: 'usr_448333',
    phone_number_masked: '+233 27 **** 908',
    momo_details: { network: 'AirtelTigo', account_name: 'KOFI BOATENG' },
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
  phone_number: '+233241234567',
  password: 'SecurePassword123!',
  kyc_status: 'VERIFIED',
})

function makeTransfer({ id, status, recipient, sendAmount, currency, createdAt }) {
  const { rate, platform, network } = corridors[currency]
  const recipientGets = (Number(sendAmount) * rate).toFixed(2)
  return {
    transfer_id: id,
    type: 'SENT',
    quote_id: makeId('qte'),
    counterparty_handle: `@${recipient.username}`,
    counterparty_name: recipient.momo_details.account_name,
    network: recipient.momo_details.network,
    send_amount: Number(sendAmount).toFixed(2),
    source_currency: currency,
    recipient_gets: recipientGets,
    target_currency: 'GHS',
    fx_rate: rate.toFixed(2),
    platform_fee: platform.toFixed(2),
    network_fee: network.toFixed(2),
    total_payable: (Number(sendAmount) + platform + network).toFixed(2),
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
    sendAmount: 50,
    currency: 'USD',
    createdAt: '2026-10-11T14:35:41Z',
  }),
)
transfers.set(
  'txn_8832920100',
  makeTransfer({
    id: 'txn_8832920100',
    status: 'PAID_OUT',
    recipient: recipients.ama,
    sendAmount: 120,
    currency: 'CAD',
    createdAt: '2026-10-09T09:12:00Z',
  }),
)
transfers.set(
  'txn_8832920055',
  makeTransfer({
    id: 'txn_8832920055',
    status: 'PAYOUT_INITIATED',
    recipient: recipients.kofi,
    sendAmount: 75,
    currency: 'GBP',
    createdAt: '2026-10-08T18:04:11Z',
  }),
)
transfers.set(
  'txn_8832920044',
  makeTransfer({
    id: 'txn_8832920044',
    status: 'FAILED',
    recipient: recipients.kwame,
    sendAmount: 30,
    currency: 'USD',
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
    if (!usernamePattern.test(body.username ?? '')) details.username = 'Usernames are letters and numbers only.'
    if (!e164.test(body.phone_number ?? '')) details.phone_number = 'Use international format, e.g. +233241234567.'
    if (!emailPattern.test(body.email ?? '')) details.email = 'Enter a valid email address.'
    if ((body.password ?? '').length < 8) details.password = 'Passwords are at least 8 characters.'
    if (Object.keys(details).length) throw new ApiError({ error_code: 'VALIDATION_ERROR', details })
    if (users.has(body.username)) throw new ApiError({ error_code: 'USERNAME_TAKEN' })
    if (findUser(body.email)) throw new ApiError({ error_code: 'EMAIL_TAKEN' })
    const user = {
      id: makeId('usr'),
      username: body.username,
      email: body.email,
      phone_number: body.phone_number,
      password: body.password,
      kyc_status: 'UNVERIFIED',
    }
    seedUser(user)
    return { access_token: issueToken(user), user: publicUser(user) }
  }

  if (method === 'POST' && path === '/auth/login') {
    const user = findUser(body.email_or_username)
    if (!user || user.password !== body.password) throw new ApiError({ error_code: 'INVALID_CREDENTIALS' })
    return { access_token: issueToken(user), user: publicUser(user) }
  }

  if (method === 'GET' && path === '/users/lookup') {
    const username = String(query.username ?? '').toLowerCase()
    if (inactiveWallets.has(username)) throw new ApiError({ error_code: 'MOMO_LOOKUP_FAILED' })
    const recipient = recipients[username]
    if (!recipient) throw new ApiError({ error_code: 'USER_NOT_FOUND' })
    return recipient
  }

  if (method === 'POST' && path === '/quotes') {
    const recipient = recipients[String(body.recipient_username ?? '').toLowerCase()]
    if (!recipient) throw new ApiError({ error_code: 'USER_NOT_FOUND' })
    const corridor = corridors[body.source_currency]
    if (!corridor) throw new ApiError({ error_code: 'VALIDATION_ERROR', details: { source_currency: 'Unsupported corridor.' } })
    const amount = Number(body.amount)
    if (!(amount > 0)) throw new ApiError({ error_code: 'VALIDATION_ERROR', details: { amount: 'Enter an amount to send.' } })
    if (amount > 10000) throw new ApiError({ error_code: 'LIMIT_EXCEEDED' })
    const quote = {
      quote_id: makeId('qte'),
      send_amount: amount.toFixed(2),
      source_currency: body.source_currency,
      recipient_gets: (amount * corridor.rate).toFixed(2),
      target_currency: body.target_currency ?? 'GHS',
      fx_rate: corridor.rate.toFixed(2),
      platform_fee: corridor.platform.toFixed(2),
      network_fee: corridor.network.toFixed(2),
      total_payable: (amount + corridor.platform + corridor.network).toFixed(2),
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
        currency: quote.source_currency,
        createdAt: nowIso(),
      }),
      quote_id: quote.quote_id,
      fx_rate: quote.fx_rate,
      platform_fee: quote.platform_fee,
      network_fee: quote.network_fee,
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
    if (!['txn_8832920192', 'txn_8832920100', 'txn_8832920055', 'txn_8832920044'].includes(id)) {
      transfers.delete(id)
    }
  }
}
