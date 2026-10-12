import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import SignupView from './SignupView.vue'
import { clearSession, session } from '../api'
import { resetMock, setMockLatency } from '../api/mock'

const Empty = { template: '<div />' }

function mountSignup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Empty },
      { path: '/send', component: Empty },
      { path: '/signin', component: Empty },
      { path: '/signup', component: SignupView },
    ],
  })
  const wrapper = mount(SignupView, { global: { plugins: [router] } })
  return { router, wrapper }
}

async function fill(wrapper, values) {
  for (const [field, value] of Object.entries(values)) {
    await wrapper.get(`#${field}`).setValue(value)
  }
}

const settle = async () => {
  await flushPromises()
  await flushPromises()
  await flushPromises()
}

beforeEach(() => {
  setMockLatency(0)
  resetMock()
  clearSession()
})

afterEach(() => {
  resetMock()
  clearSession()
})

describe('SignupView', () => {
  it('renders the four registration fields', () => {
    const { wrapper } = mountSignup()
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#phone_number').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
  })

  it('validates an empty form', async () => {
    const { wrapper } = mountSignup()
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Choose a username.')
    expect(wrapper.text()).toContain('Enter your email address.')
    expect(wrapper.text()).toContain('Enter your phone number.')
    expect(wrapper.text()).toContain('Choose a password.')
  })

  it('rejects a username with spaces', async () => {
    const { wrapper } = mountSignup()
    await fill(wrapper, { username: 'bad name' })
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Usernames are letters and numbers only.')
  })

  it('creates an account and continues to the send flow', async () => {
    const { wrapper, router } = mountSignup()
    await fill(wrapper, {
      username: 'freshuser',
      email: 'fresh@example.com',
      phone_number: '+15550009999',
      password: 'supersecret',
    })
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(session.token).toBeTruthy()
    expect(router.currentRoute.value.path).toBe('/send')
  })

  it('surfaces a taken username from the server', async () => {
    const { wrapper, router } = mountSignup()
    await router.push('/signup')
    await fill(wrapper, {
      username: 'oliver',
      email: 'fresh@example.com',
      phone_number: '+15550009999',
      password: 'supersecret',
    })
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.text()).toContain('already taken')
    expect(router.currentRoute.value.path).toBe('/signup')
  })
})
