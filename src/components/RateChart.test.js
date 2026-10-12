import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RateChart from './RateChart.vue'

describe('RateChart', () => {
  it('renders a chart with a price path', () => {
    const wrapper = mount(RateChart)
    const polyline = wrapper.find('polyline')
    expect(polyline.exists()).toBe(true)
    expect(polyline.attributes('points')).toBeTruthy()
  })

  it('marks the current price point', () => {
    const wrapper = mount(RateChart)
    expect(wrapper.find('circle').exists()).toBe(true)
  })
})