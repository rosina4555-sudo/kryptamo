import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import TrackingView from './TrackingView.vue'
import { transfers } from '../api'

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    transfers: { ...actual.transfers, list: vi.fn(), get: vi.fn(), subscribe: vi.fn() },
  }
})

const Empty = { template: '<div />' }

function makeTransfer(overrides = {}) {
  return {
    transfer_id: 'txn_1',
    counterparty_name: 'KWAME A. MENSAH',
    counterparty_handle: '@kwame',
    network: 'MTN',
    send_amount: '50000.00',
    source_currency: 'NGN',
    recipient_gets: '312.50',
    target_currency: 'GHS',
    fx_rate: '0.006250',
    platform_fee: '0.00',
    network_fee: '0.00',
    total_payable: '50000.00',
    status: 'PAID_OUT',
    created_at: '2026-10-11T14:35:41Z',
    ...overrides,
  }
}

async function mountTracking() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/transfers', component: Empty },
      { path: '/transfers/:id', component: TrackingView },
      { path: '/transfers/:id/receipt', component: Empty },
      { path: '/send', component: Empty },
    ],
  })
  router.push('/transfers/txn_1')
  await router.isReady()
  const wrapper = mount(TrackingView, { global: { plugins: [router] } })
  return { router, wrapper }
}

beforeEach(() => {
  vi.mocked(transfers.get).mockReset()
  vi.mocked(transfers.subscribe).mockReset()
})

describe('TrackingView', () => {
  it('renders the delivered transfer with a receipt link', async () => {
    vi.mocked(transfers.get).mockResolvedValue(makeTransfer())
    vi.mocked(transfers.subscribe).mockImplementation((id, handler) => {
      handler({ current_state: 'PAID_OUT', message: 'Delivered.' })
      return () => {}
    })
    const { wrapper } = await mountTracking()
    await flushPromises()
    expect(wrapper.text()).toContain('Delivered')
    expect(wrapper.text()).toContain('KWAME A. MENSAH')
    expect(wrapper.text()).toContain('GH₵312.50')
    expect(wrapper.find('a[href="/transfers/txn_1/receipt"]').exists()).toBe(true)
  })

  it('reflects a live update from the tracker', async () => {
    vi.mocked(transfers.get).mockResolvedValue(makeTransfer({ status: 'ONCHAIN_TRANSFER' }))
    vi.mocked(transfers.subscribe).mockImplementation((id, handler) => {
      handler({ current_state: 'ONCHAIN_TRANSFER', message: 'Routing funds.' })
      return () => {}
    })
    const { wrapper } = await mountTracking()
    await flushPromises()
    expect(wrapper.text()).toContain('Preparing your transfer')
    expect(wrapper.find('a[href="/transfers/txn_1/receipt"]').exists()).toBe(false)
  })

  it('surfaces a failed transfer', async () => {
    vi.mocked(transfers.get).mockResolvedValue(makeTransfer({ status: 'FAILED' }))
    vi.mocked(transfers.subscribe).mockImplementation((id, handler) => {
      handler({ current_state: 'FAILED', message: 'Failed.' })
      return () => {}
    })
    const { wrapper } = await mountTracking()
    await flushPromises()
    expect(wrapper.text()).toContain('Transfer failed')
    expect(wrapper.text()).toContain('Contact support')
  })
})
