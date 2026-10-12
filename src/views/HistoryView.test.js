import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import HistoryView from './HistoryView.vue'
import { transfers } from '../api'

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    transfers: { ...actual.transfers, list: vi.fn(), get: vi.fn(), subscribe: vi.fn() },
  }
})

const Empty = { template: '<div />' }

function makeItem(overrides = {}) {
  return {
    transfer_id: 'txn_1',
    counterparty_name: 'KWAME A. MENSAH',
    counterparty_handle: '@kwame',
    network: 'MTN',
    send_amount: '50000.00',
    source_currency: 'NGN',
    recipient_gets: '312.50',
    target_currency: 'GHS',
    status: 'PAID_OUT',
    created_at: '2026-10-11T14:35:41Z',
    ...overrides,
  }
}

function mountHistory() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/transfers', component: HistoryView },
      { path: '/transfers/:id', component: Empty },
    ],
  })
  return { router, wrapper: mount(HistoryView, { global: { plugins: [router] } }) }
}

beforeEach(() => {
  vi.mocked(transfers.list).mockReset()
})

describe('HistoryView', () => {
  it('renders a row per transfer with amounts and status', async () => {
    vi.mocked(transfers.list).mockResolvedValue({
      transfers: [makeItem(), makeItem({ transfer_id: 'txn_2', counterparty_name: 'AMA OWUSU' })],
      page: 1,
      total_pages: 1,
    })
    const { wrapper } = mountHistory()
    await flushPromises()
    expect(wrapper.text()).toContain('KWAME A. MENSAH')
    expect(wrapper.text()).toContain('AMA OWUSU')
    expect(wrapper.text()).toContain('GH₵312.50')
    expect(wrapper.text()).toContain('Delivered')
  })

  it('links each row to the transfer detail', async () => {
    vi.mocked(transfers.list).mockResolvedValue({ transfers: [makeItem()], page: 1, total_pages: 1 })
    const { wrapper } = mountHistory()
    await flushPromises()
    expect(wrapper.find('a[href="/transfers/txn_1"]').exists()).toBe(true)
  })

  it('shows an empty state when there are no transfers', async () => {
    vi.mocked(transfers.list).mockResolvedValue({ transfers: [], page: 1, total_pages: 1 })
    const { wrapper } = mountHistory()
    await flushPromises()
    expect(wrapper.text()).toContain('No transfers yet')
    expect(wrapper.text()).toContain('Send money')
  })
})
