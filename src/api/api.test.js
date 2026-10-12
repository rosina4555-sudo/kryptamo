import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ApiError } from './errors'
import { auth, quotes, session, transfers, users } from './index'
import { resetMock, setMockFlow, setMockLatency } from './mock'
import { clearSession } from './session'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

beforeEach(() => {
  setMockLatency(0)
  setMockFlow({ first: 0, step: 0 })
  resetMock()
  clearSession()
})

afterEach(() => {
  resetMock()
  clearSession()
})

describe('auth', () => {
  it('signs up a new user and stores a session', async () => {
    const user = await auth.signUp({
      username: 'newuser',
      email: 'new@example.com',
      phone_number: '+15550001234',
      password: 'supersecret',
    })
    expect(user.username).toBe('newuser')
    expect(session.user.username).toBe('newuser')
    expect(session.token).toBeTruthy()
  })

  it('rejects an invalid signup payload with field details', async () => {
    await expect(
      auth.signUp({ username: 'bad name', email: 'nope', phone_number: '123', password: 'x' }),
    ).rejects.toMatchObject({ error_code: 'VALIDATION_ERROR' })
    try {
      await auth.signUp({ username: 'bad name', email: 'nope', phone_number: '123', password: 'x' })
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect(error.details).toHaveProperty('username')
      expect(error.details).toHaveProperty('email')
      expect(error.details).toHaveProperty('phone_number')
      expect(error.details).toHaveProperty('password')
    }
  })

  it('rejects a username that is already taken', async () => {
    await expect(
      auth.signUp({
        username: 'oliver',
        email: 'other@example.com',
        phone_number: '+15550001234',
        password: 'supersecret',
      }),
    ).rejects.toMatchObject({ error_code: 'USERNAME_TAKEN' })
  })

  it('signs in an existing user', async () => {
    await auth.signIn({ email_or_username: 'oliver', password: 'SecurePassword123!' })
    expect(session.user.username).toBe('oliver')
  })

  it('rejects wrong credentials', async () => {
    await expect(
      auth.signIn({ email_or_username: 'oliver', password: 'wrong' }),
    ).rejects.toMatchObject({ error_code: 'INVALID_CREDENTIALS' })
  })
})

describe('users.lookup', () => {
  it('returns the verified recipient', async () => {
    const recipient = await users.lookup('kwame')
    expect(recipient.momo_details.account_name).toBe('KWAME A. MENSAH')
    expect(recipient.momo_details.network).toBe('MTN')
  })

  it('reports an unknown username', async () => {
    await expect(users.lookup('nobody')).rejects.toMatchObject({ error_code: 'USER_NOT_FOUND' })
  })

  it('reports an inactive Mobile Money wallet', async () => {
    await expect(users.lookup('yaw')).rejects.toMatchObject({ error_code: 'MOMO_LOOKUP_FAILED' })
  })
})

describe('quotes.create', () => {
  it('computes the recipient amount and fees', async () => {
    const quote = await quotes.create({
      recipient_username: 'kwame',
      amount: 50000,
      source_currency: 'NGN',
      target_currency: 'GHS',
    })
    expect(quote.recipient_gets).toBe('312.50')
    expect(quote.total_payable).toBe('50000.00')
    expect(quote.platform_fee).toBe('0.00')
    expect(quote.network_fee).toBe('0.00')
    expect(new Date(quote.expires_at).getTime()).toBeGreaterThan(Date.now())
  })

  it('rejects an unknown recipient', async () => {
    await expect(
      quotes.create({ recipient_username: 'ghost', amount: 100, source_currency: 'NGN' }),
    ).rejects.toMatchObject({ error_code: 'USER_NOT_FOUND' })
  })

  it('rejects amounts above the daily limit', async () => {
    await expect(
      quotes.create({ recipient_username: 'kwame', amount: 6_000_000, source_currency: 'NGN' }),
    ).rejects.toMatchObject({ error_code: 'LIMIT_EXCEEDED' })
  })
})

describe('transfers', () => {
  it('lists seeded transfer history newest first', async () => {
    const result = await transfers.list({ page: 1, limit: 10 })
    expect(result.transfers.length).toBeGreaterThanOrEqual(4)
    expect(result.transfers[0].created_at > result.transfers[1].created_at).toBe(true)
  })

  it('fetches a single transfer', async () => {
    const transfer = await transfers.get('txn_8832920192')
    expect(transfer.status).toBe('PAID_OUT')
  })

  it('creates a transfer and advances it to paid out', async () => {
    const quote = await quotes.create({ recipient_username: 'kwame', amount: 50000, source_currency: 'NGN' })
    const created = await transfers.create({
      quote_id: quote.quote_id,
      payment_method: { type: 'mobile_money', network: 'MTN MoMo' },
      idempotency_key: 'idem-1',
    })
    expect(created.status).toBe('FUNDING_PENDING')

    const seen = []
    const unsubscribe = transfers.subscribe(created.transfer_id, (payload) => {
      seen.push(payload.current_state)
    })
    await sleep(80)
    unsubscribe()

    expect(seen).toContain('FUNDED')
    expect(seen[seen.length - 1]).toBe('PAID_OUT')
  })

  it('is idempotent for a repeated key', async () => {
    const quote = await quotes.create({ recipient_username: 'kwame', amount: 50000, source_currency: 'NGN' })
    const first = await transfers.create({ quote_id: quote.quote_id, idempotency_key: 'idem-2' })
    const second = await transfers.create({ quote_id: quote.quote_id, idempotency_key: 'idem-2' })
    expect(second.transfer_id).toBe(first.transfer_id)
  })

  it('rejects an unknown quote', async () => {
    await expect(transfers.create({ quote_id: 'qte_missing' })).rejects.toMatchObject({
      error_code: 'QUOTE_EXPIRED',
    })
  })
})
