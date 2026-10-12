import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import QuoteSummary from './QuoteSummary.vue'

const now = Date.now()

function makeProps(overrides = {}) {
  return {
    sendAmount: 50,
    fees: 2,
    rate: 15.6,
    expiresAt: now + 5 * 60_000,
    ...overrides,
  }
}

function payButton(wrapper, expired = false) {
  const text = expired ? 'Get new quote' : 'Pay'
  return wrapper.findAll('button').find((b) => b.text().includes(text))
}

function feesButton(wrapper) {
  return wrapper.findAll('button').find((b) => b.text().includes('Fees'))
}

describe('QuoteSummary', () => {
  it('shows the payable total and recipient amount', () => {
    const wrapper = mount(QuoteSummary, { props: makeProps() })
    const rendered = wrapper.text().replace(/\s+/g, ' ')
    expect(rendered).toContain('You pay')
    expect(rendered).toContain('$52.00')
    expect(rendered).toContain('GH₵780.00')
  })

  it('shows the rate locked message', () => {
    const wrapper = mount(QuoteSummary, { props: makeProps() })
    expect(wrapper.text()).toContain('Rate locked for')
  })

  it('disables pay and offers a new quote when expired', () => {
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

  it('itemizes fees on demand when the split is provided', async () => {
    const wrapper = mount(QuoteSummary, {
      props: makeProps({ platformFee: 1.5, networkFee: 0.5 }),
    })
    expect(wrapper.text()).not.toContain('Network fee')
    await feesButton(wrapper).trigger('click')
    expect(wrapper.text()).toContain('Platform fee')
    expect(wrapper.text()).toContain('Network fee')
    expect(wrapper.text()).toContain('$1.50')
    expect(wrapper.text()).toContain('$0.50')
  })
})