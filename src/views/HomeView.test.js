import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount } from '@vue/test-utils'
import HomeView from './HomeView.vue'
import SendView from './SendView.vue'

function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/send', name: 'send', component: SendView },
    ],
  })
  router.push('/')
  return mount(HomeView, { global: { plugins: [router] } })
}

describe('HomeView', () => {
  const text = () => mountView().text().replace(/\s+/g, ' ')

  it('renders the headline', () => {
    expect(text()).toContain('Send money across Africa.')
  })

  it('renders the send CTA', () => {
    const links = mountView().findAll('a').map((link) => link.text())
    expect(links).toContain('Send money')
  })

  it('shows the live rate across the launch corridor', () => {
    const rendered = text()
    expect(rendered).toContain('LIVE 1 NGN =')
    expect(rendered).toContain('0.00625')
  })

  it('renders the primary call to action', () => {
    const links = mountView().findAll('a').map((link) => link.text())
    expect(links).toContain('Send your first transfer')
  })

  it('itemizes the fee breakdown as free', () => {
    const rendered = text()
    expect(rendered).toContain('Platform fee')
    expect(rendered).toContain('Network fee')
    expect(rendered).toContain('GH₵0.00')
    expect(rendered).toContain('Free')
  })

  it('renders the rate conversion selector under the hero', () => {
    const rendered = text()
    expect(rendered).toContain('YOU SEND')
    expect(rendered).toContain('THEY RECEIVE')
    expect(rendered).toContain('Mobile Money')
  })

  it('presents the animated transfer steps', () => {
    const wrapper = mountView()
    const rendered = wrapper.text().replace(/\s+/g, ' ')
    expect(rendered).toContain('HOW IT WORKS')
    expect(rendered).toContain('Every transfer follows the same track.')
    expect(wrapper.find('.track-fill').exists()).toBe(true)
  })

  it('renders the redesigned footer with a reference rate and account links', () => {
    const wrapper = mountView()
    const rendered = wrapper.text().replace(/\s+/g, ' ')
    expect(rendered).toContain('REFERENCE RATE')
    expect(rendered).toContain('NGN → GHS')
    expect(wrapper.find('footer svg[aria-hidden="true"]').exists()).toBe(true)
    const links = wrapper.findAll('footer a').map((link) => link.text())
    expect(links).toContain('Create account')
    expect(links).toContain('Sign in')
  })
})