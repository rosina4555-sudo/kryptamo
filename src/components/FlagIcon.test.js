import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FlagIcon from './FlagIcon.vue'

describe('FlagIcon', () => {
  it('renders an svg for each sender and recipient flag', () => {
    for (const code of ['NG', 'KE', 'GH', 'SN']) {
      const wrapper = mount(FlagIcon, { props: { code } })
      expect(wrapper.find('svg').exists()).toBe(true)
    }
  })

  it('renders the regional-indicator flag glyph for the country', () => {
    const wrapper = mount(FlagIcon, { props: { code: 'NG' } })
    expect(wrapper.find('svg text').text()).toBe('🇳🇬')
  })

  it('is decorative and hidden from assistive tech', () => {
    const wrapper = mount(FlagIcon, { props: { code: 'NG' } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})
