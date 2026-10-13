import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
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
      { path: '/signin', component: { template: '<div />' } },
      { path: '/signup', component: { template: '<div />' } },
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

  it('frames transfers as any-to-any across Africa', () => {
    const rendered = text()
    expect(rendered).toContain('Any African country to any African country.')
    expect(rendered).toContain('20 African countries')
  })

  it('plays the hero illustration video with a poster fallback', () => {
    const wrapper = mountView()
    const video = wrapper.find('video')
    expect(video.exists()).toBe(true)
    expect(video.attributes('autoplay')).toBeDefined()
    expect(video.element.muted).toBe(true)
    expect(video.attributes('loop')).toBeDefined()
    expect(video.attributes('poster')).toBe('/hero-city.webp')
    expect(video.find('source').attributes('src')).toBe('/kryptamo-hero.mp4')
  })

  it('falls back to the still image when reduced motion is preferred', async () => {
    const original = window.matchMedia
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
    try {
      const wrapper = mountView()
      await nextTick()
      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('img[src="/hero-city.webp"]').exists()).toBe(true)
    } finally {
      window.matchMedia = original
    }
  })

  it('answers common questions in the FAQ', () => {
    const wrapper = mountView()
    const rendered = wrapper.text().replace(/\s+/g, ' ')
    expect(rendered).toContain('Questions, answered.')
    expect(wrapper.findAll('details').length).toBe(6)
    expect(rendered).toContain('How is Kryptamo free?')
    expect(rendered).toContain('Does Kryptamo hold my money?')
  })

  it('itemizes the fee breakdown as free', () => {
    const rendered = text()
    expect(rendered).toContain('Platform fee')
    expect(rendered).toContain('Network fee')
    expect(rendered).toContain('₦0.00')
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