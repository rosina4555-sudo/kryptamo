import { describe, expect, it } from 'vitest'
import { formatMoney, formatAmount, initials, maskPhone } from './format.js'

describe('formatMoney', () => {
  it('formats with two decimals for USD', () => {
    expect(formatMoney(50, 'USD')).toBe('$50.00')
  })

  it('appends the currency code when requested', () => {
    expect(formatMoney(50, 'USD', { showCode: true })).toBe('$50.00 USD')
  })

  it('formats Ghana cedis', () => {
    expect(formatMoney(780, 'GHS')).toBe('GH₵780.00')
  })
})

describe('formatAmount', () => {
  it('combines symbol and code', () => {
    expect(formatAmount(780, 'GHS')).toBe('GH₵780.00 GHS')
  })
})

describe('initials', () => {
  it('takes first letters of the first two parts', () => {
    expect(initials('KWAME A. MENSAH')).toBe('KA')
  })

  it('handles a single name', () => {
    expect(initials('Kwame')).toBe('K')
  })
})

describe('maskPhone', () => {
  it('masks the middle and keeps last three digits', () => {
    expect(maskPhone('+233241234567')).toBe('+233 24 **** 567')
  })
})