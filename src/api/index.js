import { apiRequest } from './client'
import { clearSession, setSession } from './session'
import { USE_MOCK, WS_BASE_URL } from './config'
import { mockSubscribe } from './mock'

export const auth = {
  async signUp(payload) {
    const data = await apiRequest('/auth/signup', { method: 'POST', body: payload })
    setSession(data)
    return data.user
  },
  async signIn(payload) {
    const data = await apiRequest('/auth/login', { method: 'POST', body: payload })
    setSession(data)
    return data.user
  },
  signOut() {
    clearSession()
  },
}

export const users = {
  lookup(username) {
    return apiRequest('/users/lookup', { query: { username } })
  },
}

export const quotes = {
  create(payload) {
    return apiRequest('/quotes', { method: 'POST', body: payload })
  },
}

export const transfers = {
  create(payload) {
    return apiRequest('/transfers', { method: 'POST', body: payload })
  },
  list({ page = 1, limit = 20 } = {}) {
    return apiRequest('/transfers', { query: { page, limit } })
  },
  get(id) {
    return apiRequest(`/transfers/${id}`)
  },
  subscribe(id, handler) {
    if (USE_MOCK) return mockSubscribe(id, handler)
    const socket = new WebSocket(`${WS_BASE_URL}/ws/transfers/${id}`)
    socket.onmessage = (event) => {
      try {
        handler(JSON.parse(event.data))
      } catch {
        /* ignore malformed frames */
      }
    }
    return () => socket.close()
  },
}

export { session, isSignedIn, clearSession, setSession } from './session'
export { ApiError } from './errors'
export { STATE_LABELS, HUMAN_STEPS, stateLabel, stepIndex, stepStatus, isTerminal, isFailed } from './states'
