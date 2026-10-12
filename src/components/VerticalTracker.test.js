import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VerticalTracker from './VerticalTracker.vue'

const stepTexts = (wrapper) => wrapper.findAll('li').map((item) => item.text())

describe('VerticalTracker', () => {
  it('lists the four human steps', () => {
    const wrapper = mount(VerticalTracker, { props: { status: 'FUNDED' } })
    expect(wrapper.findAll('li')).toHaveLength(4)
    expect(wrapper.text()).toContain('Payment received')
    expect(wrapper.text()).toContain('Delivered')
  })

  it('marks earlier steps done and later steps waiting', () => {
    const texts = stepTexts(mount(VerticalTracker, { props: { status: 'PAYOUT_INITIATED' } }))
    expect(texts[0]).toContain('Done')
    expect(texts[1]).toContain('Done')
    expect(texts[2]).toContain('In progress')
    expect(texts[3]).toContain('Waiting')
  })

  it('shows the first step as pending while awaiting payment', () => {
    const texts = stepTexts(mount(VerticalTracker, { props: { status: 'FUNDING_PENDING' } }))
    expect(texts[0]).toContain('Waiting')
  })

  it('flags a stopped step when the transfer fails', () => {
    const wrapper = mount(VerticalTracker, { props: { status: 'FAILED' } })
    expect(wrapper.text()).toContain('Stopped here')
    expect(wrapper.find('.text-alert').exists()).toBe(true)
  })
})
