import { reactive } from 'vue'

const STORAGE_KEY = 'kryptamo.session'

function readStored() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

const stored = readStored()

export const session = reactive({
  token: stored.token ?? null,
  user: stored.user ?? null,
})

export function setSession({ access_token, user }) {
  session.token = access_token ?? null
  session.user = user ?? null
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({ token: session.token, user: session.user }))
  } catch {
    /* storage unavailable */
  }
}

export function clearSession() {
  session.token = null
  session.user = null
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function isSignedIn() {
  return Boolean(session.token)
}

export function authHeader() {
  return session.token ? { Authorization: `Bearer ${session.token}` } : {}
}
