import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import SendView from './SendView.vue'
import { clearSession } from '../api'
import { resetMock, setMockLatency } from '../api/mock'

const Empty = { template: '<div />' }

function mountSend() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Empty },
      { path: '/send', component: SendView },
      { path: '/signin', component: Empty },
      { path: '/transfers', component: Empty },
      { path: '/transfers/:id', component: Empty },
    ],
  })
  const wrapper = mount(SendView, {
    global: { plugins: [router], stubs: { teleport: true } },
  })
  return { router, wrapper }
}

const findButton = (wrapper, text) => wrapper.findAll('button').find((btn) => btn.text().includes(text))

beforeEach(() => {
  vi.useFakeTimers()
  setMockLatency(0)
  resetMock()
  clearSession()
})

afterEach(() => {
  vi.useRealTimers()
  resetMock()
  clearSession()
})

describe('SendView', () => {
  it('verifies a username and shows the quoted cedis', async () => {
    const { wrapper } = mountSend()
    await wrapper.get('#handle').setValue('kwame')
    await vi.advanceTimersByTimeAsync(1200)
    await flushPromises()
    expect(wrapper.text()).toContain('KWAME A. MENSAH')
    expect(wrapper.text()).toContain('GH₵780.00')
    expect(wrapper.text()).toContain('$52.00')
  })

  it('requotes when the send currency changes', async () => {
    const { wrapper } = mountSend()
    const gbp = wrapper.findAll('button').find((btn) => btn.text().includes('GBP'))
    await gbp.trigger('click')
    await wrapper.get('#handle').setValue('kwame')
    await vi.advanceTimersByTimeAsync(1200)
    await flushPromises()
    expect(wrapper.text()).toContain('GH₵990.00')
    expect(wrapper.text()).toContain('£51.60')
  })

  it('reports an unknown username', async () => {
    const { wrapper } = mountSend()
    await wrapper.get('#handle').setValue('zzz')
    await vi.advanceTimersByTimeAsync(1200)
    await flushPromises()
    expect(wrapper.text()).toContain('couldn’t find that username')
  })

  it('reports an unverifiable Mobile Money account', async () => {
    const { wrapper } = mountSend()
    await wrapper.get('#handle').setValue('yaw')
    await vi.advanceTimersByTimeAsync(1200)
    await flushPromises()
    expect(wrapper.text()).toContain('couldn’t verify this Mobile Money account')
  })

  it('opens the checkout and routes to tracking after payment', async () => {
    const { wrapper, router } = mountSend()
    await wrapper.get('#handle').setValue('kwame')
    await vi.advanceTimersByTimeAsync(1200)
    await flushPromises()

    await findButton(wrapper, 'Pay $52.00').trigger('click')
    await vi.advanceTimersByTimeAsync(10)
    await flushPromises()

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
    expect(dialog.text()).toContain('checkout.honeycoin.app')

    await dialog.findAll('button').find((btn) => btn.text().includes('Pay $52.00')).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(router.currentRoute.value.path.startsWith('/transfers/')).toBe(true)
  })
})
