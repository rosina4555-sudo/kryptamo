import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount } from '@vue/test-utils'
import RateSelector from './RateSelector.vue'
import { COUNTRIES } from '../data/countries'

function mountSelector() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/send', component: { template: '<div />' } },
    ],
  })
  router.push('/')
  return mount(RateSelector, { global: { plugins: [router] } })
}

const select = (wrapper, label) => wrapper.get(`select[aria-label="${label}"]`)

describe('RateSelector', () => {
  it('offers every country as both a sending and receiving option', () => {
    const wrapper = mountSelector()
    expect(select(wrapper, 'Sending country').findAll('option').length).toBe(COUNTRIES.length)
    expect(select(wrapper, 'Receiving country').findAll('option').length).toBe(COUNTRIES.length)
  })

  it('defaults to sending 50,000 NGN and shows the cedis received', () => {
    const wrapper = mountSelector()
    expect(wrapper.get('input').element.value).toBe('50000')
    expect(wrapper.text()).toContain('GH₵312.50')
  })

  it('recalculates when the sending country changes', async () => {
    const wrapper = mountSelector()
    await select(wrapper, 'Sending country').setValue('KE')
    expect(wrapper.text()).toContain('1 KES =')
    expect(wrapper.text()).toContain('GH₵4,545.45')
  })

  it('recalculates when the receiving country changes', async () => {
    const wrapper = mountSelector()
    await select(wrapper, 'Receiving country').setValue('KE')
    expect(wrapper.text()).toContain('1 NGN =')
    expect(wrapper.text()).toContain('KSh3,437.50')
    expect(wrapper.text()).toContain('M-Pesa')
  })

  it('shows the sender and recipient country flags', () => {
    const wrapper = mountSelector()
    expect(wrapper.findAll('svg').length).toBeGreaterThanOrEqual(3)
    expect(wrapper.text()).toContain('Ghana')
    expect(wrapper.text()).toContain('Mobile Money')
  })

  it('lists the Mobile Money providers for the receiving country', () => {
    const wrapper = mountSelector()
    expect(wrapper.text()).toContain('Pays out to Ghana')
    expect(wrapper.text()).toContain('MTN Mobile Money')
    expect(wrapper.text()).toContain('Telecel Cash')
    expect(wrapper.text()).toContain('AirtelTigo Money')
  })

  it('shows free fees and the estimated arrival time', () => {
    const wrapper = mountSelector()
    const text = wrapper.text()
    expect(text).toContain('Fees')
    expect(text).toContain('Free')
    expect(text).toContain('₦0.00')
    expect(text).toContain('Arrival')
    expect(text).toContain('Seconds')
  })

  it('swaps the sending and receiving countries', async () => {
    const wrapper = mountSelector()
    const swap = wrapper.findAll('button').find((button) => button.text() === 'Swap')
    await swap.trigger('click')
    expect(select(wrapper, 'Sending country').element.value).toBe('GH')
    expect(select(wrapper, 'Receiving country').element.value).toBe('NG')
  })
})
