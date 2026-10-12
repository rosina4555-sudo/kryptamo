import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipientCard from './RecipientCard.vue'

function makeRecipient(overrides = {}) {
  return {
    username: 'kwame',
    account_name: 'KWAME A. MENSAH',
    phone_number_masked: '+233 24 **** 567',
    momo_details: { network: 'MTN' },
    ...overrides,
  }
}

describe('RecipientCard', () => {
  it('renders the verified account name', () => {
    const wrapper = mount(RecipientCard, { props: { recipient: makeRecipient() } })
    expect(wrapper.text()).toContain('KWAME A. MENSAH')
  })

  it('shows the handle and network', () => {
    const wrapper = mount(RecipientCard, { props: { recipient: makeRecipient() } })
    expect(wrapper.text()).toContain('@kwame')
    expect(wrapper.text()).toContain('MTN Mobile Money')
  })

  it('shows the masked phone number', () => {
    const wrapper = mount(RecipientCard, { props: { recipient: makeRecipient() } })
    expect(wrapper.text()).toContain('+233 24 **** 567')
  })

  it('derives initials from the account name', () => {
    const wrapper = mount(RecipientCard, { props: { recipient: makeRecipient() } })
    expect(wrapper.text()).toContain('KA')
  })
})