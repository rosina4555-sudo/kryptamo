import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount } from '@vue/test-utils'
import FaqSection from './FaqSection.vue'

function mountFaq() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  router.push('/')
  return mount(FaqSection, { global: { plugins: [router] } })
}

describe('FaqSection', () => {
  it('renders a question and answer per item', () => {
    const wrapper = mountFaq()
    const text = wrapper.text()
    expect(text).toContain('Questions, answered.')
    expect(wrapper.findAll('details').length).toBe(6)
    expect(text).toContain('How is Kryptamo free?')
    expect(text).toContain('Why does my quote expire in five minutes?')
    expect(text).toContain('What happens if a transfer fails?')
  })

  it('uses native disclosure elements collapsed by default', () => {
    const wrapper = mountFaq()
    const details = wrapper.findAll('details')
    expect(details.every((item) => item.attributes('open') === undefined)).toBe(true)
    expect(wrapper.findAll('summary').length).toBe(6)
  })

  it('links to a support path', () => {
    const link = mountFaq().find('a[href="/signup"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Contact support')
  })
})
