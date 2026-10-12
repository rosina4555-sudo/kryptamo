import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount } from '@vue/test-utils'
import RateSelector from './RateSelector.vue'

function mountSelector() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/send', component: { template: '<div />' } }],
  })
  router.push('/')
  return mount(RateSelector, { global: { plugins: [router] } })
}

const buttonByText = (wrapper, label) =>
  wrapper.findAll('button').find((button) => button.text().includes(label))

describe('RateSelector', () => {
  it('defaults to sending 100 USD and shows the cedis received', () => {
    const wrapper = mountSelector()
    expect(wrapper.get('input').element.value).toBe('100')
    expect(wrapper.text()).toContain('GH₵1,560.00')
  })

  it('recalculates when the sending country changes', async () => {
    const wrapper = mountSelector()
    await buttonByText(wrapper, 'Canada').trigger('click')
    expect(wrapper.text()).toContain('1 CAD =')
    expect(wrapper.text()).toContain('GH₵1,140.00')
  })

  it('shows the sender and recipient country flags', () => {
    const wrapper = mountSelector()
    expect(wrapper.findAll('svg').length).toBeGreaterThanOrEqual(5)
    expect(wrapper.text()).toContain('Ghana')
    expect(wrapper.text()).toContain('Mobile Money')
  })

  it('lists the Mobile Money providers it pays out to', () => {
    const wrapper = mountSelector()
    expect(wrapper.text()).toContain('PAYS OUT TO')
    const alts = wrapper.findAll('img').map((img) => img.attributes('alt'))
    expect(alts).toContain('MTN Mobile Money')
    expect(alts).toContain('Telecel Cash')
    expect(alts).toContain('AirtelTigo Money')
  })

  it('shows the fees and estimated arrival time', () => {
    const wrapper = mountSelector()
    const rendered = wrapper.text()
    expect(rendered).toContain('Fees')
    expect(rendered).toContain('$2.00')
    expect(rendered).toContain('Arrival')
    expect(rendered).toContain('10 min')
  })
})
