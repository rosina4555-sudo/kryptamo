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
    expect(text()).toContain('Send money to a person in Ghana.')
  })

  it('renders the send CTA', () => {
    const links = mountView().findAll('a').map((link) => link.text())
    expect(links).toContain('Send money')
  })

  it('shows the live rate and captured-rate numerals', () => {
    const rendered = text()
    expect(rendered).toContain('Live · 1 USD =')
    expect(rendered).toContain('15.60')
  })

  it('shows the verified recipient card and live summary', () => {
    const rendered = text()
    expect(rendered).toContain('KWAME A. MENSAH')
    expect(rendered).toContain('GH₵780.00')
    expect(rendered).toContain('Rate locked for')
  })

  it('itemizes the fee breakdown', () => {
    const rendered = text()
    expect(rendered).toContain('Platform fee')
    expect(rendered).toContain('Network fee')
    expect(rendered).toContain('$1.50')
    expect(rendered).toContain('$0.50')
  })
})