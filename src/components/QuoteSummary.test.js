import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import QuoteSummary from './QuoteSummary.vue'

const now = Date.now()

function makeProps(overrides = {}) {
  return {
    sendAmount: 50000,
    fees: 0,
    rate: 0.00625,
    expiresAt: now + 5 * 60_000,
    ...overrides,
  }
}

function payButton(wrapper, expired = false) {
  const text = expired ? 'Get new quote' : 'Pay'
  return wrapper.findAll('button').find((btn) => btn.text().includes(text))
}

function feesButton(wrapper) {
  return wrapper.findAll('button').find((btn) => btn.text().includes('Fees'))
}

describe('QuoteSummary', () => {
  it('renders the delivered amount and a zero fee line', () => {
    const wrapper = mount(QuoteSummary, { props: makeProps() })
    const rendered = wrapper.text()
    expect(rendered).toContain('₦50,000.00')
    expect(rendered).toContain('GH₵312.50')
    expect(rendered).toContain('Free')
    expect(rendered).toContain('1 NGN = 0.00625 GHS')
  })

  it('locks the rate for the quote window', () => {
    const wrapper = mount(QuoteSummary, { props: makeProps() })
    expect(wrapper.text()).toContain('Rate locked for')
  })

  it('disables the pay action once the quote expires', () => {
    const wrapper = mount(QuoteSummary, { props: makeProps({ expiresAt: now - 1000 }) })
    const button = payButton(wrapper, true)
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Get new quote')
  })

  it('emits pay when clicked while valid', async () => {
    const wrapper = mount(QuoteSummary, { props: makeProps() })
    await payButton(wrapper).trigger('click')
    expect(wrapper.emitted('pay')).toHaveLength(1)
  })

  it('itemizes the fee split on demand', async () => {
    const wrapper = mount(QuoteSummary, {
      props: makeProps({ platformFee: 0, networkFee: 0 }),
    })
    expect(wrapper.text()).not.toContain('Network fee')
    await feesButton(wrapper).trigger('click')
    expect(wrapper.text()).toContain('Platform fee')
    expect(wrapper.text()).toContain('Network fee')
  })
})