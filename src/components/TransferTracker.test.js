import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TransferTracker from './TransferTracker.vue'

const steps = [
  { label: 'Payment received', time: '2:35 pm', icon: 'card' },
  { label: 'Preparing your transfer', time: '2:36 pm', icon: 'convert' },
  { label: 'Sending to MTN Mobile Money', time: 'now', icon: 'route' },
  { label: 'Delivered', time: '', icon: 'delivered' },
]

describe('TransferTracker', () => {
  it('renders every step label', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 1 } })
    for (const step of steps) expect(wrapper.text()).toContain(step.label)
  })

  it('marks completed steps with a check badge', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 2 } })
    const completed = wrapper.find('li:nth-of-type(1)')
    expect(completed.find('.step-check').exists()).toBe(true)
    expect(wrapper.find('li:nth-of-type(3) .step-check').exists()).toBe(false)
  })

  it('pulses the current step', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 1 } })
    const current = wrapper.find('li:nth-of-type(2)')
    expect(current.find('.animate-ping').exists()).toBe(true)
  })

  it('advances the connector progress with the current step', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 3 } })
    const fills = wrapper.findAll('.track-fill')
    expect(fills.length).toBe(steps.length - 1)
    for (const fill of fills) expect(fill.attributes('style')).toContain('width: 100%')
  })

  it('supports a dark tone', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 1, tone: 'dark' } })
    expect(wrapper.find('.track-fill').classes()).toContain('bg-volta-tint')
  })
})
