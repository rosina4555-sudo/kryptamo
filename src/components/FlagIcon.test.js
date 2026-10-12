import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FlagIcon from './FlagIcon.vue'

describe('FlagIcon', () => {
  it('renders an svg for each corridor and recipient flag', () => {
    for (const code of ['US', 'CA', 'GB', 'GH']) {
      const wrapper = mount(FlagIcon, { props: { code } })
      expect(wrapper.find('svg').exists()).toBe(true)
    }
  })

  it('is decorative and hidden from assistive tech', () => {
    const wrapper = mount(FlagIcon, { props: { code: 'US' } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})
