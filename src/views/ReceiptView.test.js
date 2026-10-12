import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import ReceiptView from './ReceiptView.vue'
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
    send_amount: '50.00',
    source_currency: 'USD',
    recipient_gets: '780.00',
    target_currency: 'GHS',
    fx_rate: '15.60',
    platform_fee: '1.50',
    network_fee: '0.50',
    total_payable: '52.00',
    status: 'PAID_OUT',
    created_at: '2026-10-11T14:35:41Z',
    ...overrides,
  }
}

async function mountReceipt(transfer = makeTransfer()) {
  vi.mocked(transfers.get).mockResolvedValue(transfer)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/transfers/:id', component: Empty },
      { path: '/transfers/:id/receipt', component: ReceiptView },
      { path: '/send', component: Empty },
    ],
  })
  router.push('/transfers/txn_1/receipt')
  await router.isReady()
  const wrapper = mount(ReceiptView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.mocked(transfers.get).mockReset()
})

describe('ReceiptView', () => {
  it('renders the transfer reference and amounts', async () => {
    const wrapper = await mountReceipt()
    expect(wrapper.text()).toContain('txn_1')
    expect(wrapper.text()).toContain('KWAME A. MENSAH')
    expect(wrapper.text()).toContain('GH₵780.00')
    expect(wrapper.text()).toContain('$52.00')
    expect(wrapper.text()).toContain('Delivered')
  })

  it('offers a print action', async () => {
    const wrapper = await mountReceipt()
    expect(wrapper.findAll('button').some((btn) => btn.text().includes('Print receipt'))).toBe(true)
  })

  it('explains a failed transfer instead of success copy', async () => {
    const wrapper = await mountReceipt(makeTransfer({ status: 'FAILED' }))
    expect(wrapper.text()).toContain('didn’t complete')
  })
})
