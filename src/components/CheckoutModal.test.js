import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckoutModal from './CheckoutModal.vue'

function mountModal(overrides = {}) {
  return mount(CheckoutModal, {
    props: {
      open: true,
      amount: 52,
      currency: 'USD',
      recipientName: 'KWAME A. MENSAH',
      gatewayUrl: 'https://checkout.honeycoin.app/pay/checkout_1',
      ...overrides,
    },
    global: { stubs: { teleport: true } },
  })
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('CheckoutModal', () => {
  it('shows the gateway host, amount and recipient', () => {
    const wrapper = mountModal()
    expect(wrapper.text()).toContain('checkout.honeycoin.app')
    expect(wrapper.text()).toContain('$52.00')
    expect(wrapper.text()).toContain('KWAME A. MENSAH')
  })

  it('renders nothing when closed', () => {
    const wrapper = mountModal({ open: false })
    expect(wrapper.text()).toBe('')
  })

  it('emits close when cancelled', async () => {
    const wrapper = mountModal()
    await wrapper.find('button[aria-label="Cancel payment"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits paid after the payment is confirmed', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('button').find((btn) => btn.text().includes('Pay')).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.emitted('paid')).toBeTruthy()
  })
})
