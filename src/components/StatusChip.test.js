import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusChip from './StatusChip.vue'

describe('StatusChip', () => {
  it('shows the delivered label and tone for a paid-out transfer', () => {
    const wrapper = mount(StatusChip, { props: { status: 'PAID_OUT' } })
    expect(wrapper.text()).toContain('Delivered')
    expect(wrapper.get('span').classes()).toContain('text-delivered')
  })

  it('shows a failure tone for a failed transfer', () => {
    const wrapper = mount(StatusChip, { props: { status: 'FAILED' } })
    expect(wrapper.text()).toContain('Transfer failed')
    expect(wrapper.get('span').classes()).toContain('text-alert')
  })

  it('shows an in-progress label for mid-flight states', () => {
    const wrapper = mount(StatusChip, { props: { status: 'ONCHAIN_TRANSFER' } })
    expect(wrapper.text()).toContain('Preparing your transfer')
  })

  it('falls back for an unknown state', () => {
    const wrapper = mount(StatusChip, { props: { status: 'SOMETHING_NEW' } })
    expect(wrapper.text()).toContain('In progress')
  })
})
