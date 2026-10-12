import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from './LoginView.vue'
import { clearSession } from '../api'
import { setMockLatency } from '../api/mock'

const Empty = { template: '<div />' }

function mountLogin() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Empty },
      { path: '/send', component: Empty },
      { path: '/signin', component: LoginView },
      { path: '/signup', component: Empty },
    ],
  })
  const wrapper = mount(LoginView, { global: { plugins: [router] } })
  return { router, wrapper }
}

function buttonByText(wrapper, text) {
  return wrapper.findAll('button').find((b) => b.text().includes(text))
}

beforeEach(() => {
  vi.useFakeTimers()
  setMockLatency(0)
  clearSession()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('LoginView', () => {
  it('renders the Google sign-in option', () => {
    const { wrapper } = mountLogin()
    expect(buttonByText(wrapper, 'Continue with Google')).toBeTruthy()
  })

  it('validates an empty form instead of submitting', async () => {
    const { wrapper, router } = mountLogin()
    await router.push('/signin')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Enter your email')
    expect(wrapper.text()).toContain('Enter your password.')
    expect(router.currentRoute.value.path).toBe('/signin')
  })

  it('rejects a malformed email', async () => {
    const { wrapper } = mountLogin()
    await wrapper.get('#identifier').setValue('you@wrong')
    await wrapper.get('#password').setValue('supersecret')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('doesn’t look right')
  })

  it('toggles password visibility', async () => {
    const { wrapper } = mountLogin()
    expect(wrapper.get('#password').attributes('type')).toBe('password')
    await wrapper.get('button[aria-label="Show password"]').trigger('click')
    expect(wrapper.get('#password').attributes('type')).toBe('text')
  })

  it('rejects wrong credentials with an error', async () => {
    const { wrapper, router } = mountLogin()
    await router.push('/signin')
    await wrapper.get('#identifier').setValue('oliver')
    await wrapper.get('#password').setValue('wrongpassword')
    await wrapper.get('form').trigger('submit')
    await vi.advanceTimersByTimeAsync(50)
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/signin')
    expect(wrapper.text()).toContain('don’t match')
  })

  it('navigates to the transfer flow on valid credentials', async () => {
    const { wrapper, router } = mountLogin()
    await wrapper.get('#identifier').setValue('oliver')
    await wrapper.get('#password').setValue('SecurePassword123!')
    await wrapper.get('form').trigger('submit')
    await vi.advanceTimersByTimeAsync(50)
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/send')
  })

  it('routes to the transfer flow after Google sign-in', async () => {
    const { wrapper, router } = mountLogin()
    await buttonByText(wrapper, 'Continue with Google').trigger('click')
    await vi.advanceTimersByTimeAsync(900)
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/send')
  })
})
