import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TransferTracker from './TransferTracker.vue'

const steps = [
  { label: 'Payment received', time: '2:35 pm' },
  { label: 'Preparing your transfer', time: '2:36 pm' },
  { label: 'Sending to MTN Mobile Money', time: 'now' },
  { label: 'Delivered', time: '' },
]

describe('TransferTracker', () => {
  it('renders every step label', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 1 } })
    for (const step of steps) expect(wrapper.text()).toContain(step.label)
  })

  it('shows completed steps with a check', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 2 } })
    const completed = wrapper.find('li:nth-of-type(1)')
    expect(completed.find('svg')).toBeTruthy()
  })

  it('shows the current step as active', () => {
    const wrapper = mount(TransferTracker, { props: { steps, currentIndex: 1 } })
    const current = wrapper.find('li:nth-of-type(2) span.flex')
    expect(current.classes()).toContain('animate-pulse')
  })
})