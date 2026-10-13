import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MapCorridor from './MapCorridor.vue'
import { MAP_COUNTRIES } from '../data/worldMap'

describe('MapCorridor', () => {
  it('labels the map with every source corridor', () => {
    const wrapper = mount(MapCorridor)
    const label = wrapper.get('svg').attributes('aria-label')
    expect(label).toContain('Senegal')
    expect(label).toContain('Ivory Coast')
    expect(label).toContain('Nigeria')
    expect(label).toContain('Ghana')
  })

  it('highlights every country in the mesh', () => {
    const wrapper = mount(MapCorridor)
    expect(wrapper.findAll('.land-node').length).toBe(4)
    expect(wrapper.findAll('.land-source').length).toBe(0)
    expect(wrapper.findAll('.land-dest').length).toBe(0)
  })

  it('draws a two-way route per corridor', () => {
    const wrapper = mount(MapCorridor)
    expect(wrapper.findAll('.route-comet').length).toBe(4)
    expect(wrapper.findAll('.route-base').length).toBe(4)
  })

  it('renders the projected land geometry', () => {
    const wrapper = mount(MapCorridor)
    expect(MAP_COUNTRIES.length).toBeGreaterThan(50)
    expect(wrapper.findAll('.land path').length).toBe(MAP_COUNTRIES.length)
  })

  it('drops the looping motion when rendered statically', () => {
    const wrapper = mount(MapCorridor, { props: { animated: false } })
    expect(wrapper.findAll('.route-comet').length).toBe(0)
    expect(wrapper.find('.map-static').exists()).toBe(true)
    expect(wrapper.findAll('[marker-end]').length).toBe(4)
  })
})