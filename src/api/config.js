const env = import.meta.env ?? {}

export const USE_MOCK = env.VITE_USE_MOCK !== 'false'
export const API_BASE_URL = env.VITE_API_BASE_URL ?? '/api/v1'
export const WS_BASE_URL = env.VITE_WS_BASE_URL ?? 'wss://api.kryptamo.com'
