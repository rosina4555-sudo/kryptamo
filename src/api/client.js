import { ApiError, normalizeError } from './errors'
import { authHeader } from './session'
import { USE_MOCK, API_BASE_URL } from './config'
import { mockRequest } from './mock'

function buildQuery(query) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.set(key, value)
  }
  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, query } = options

  if (USE_MOCK) {
    try {
      return await mockRequest({ method, path, body, query })
    } catch (error) {
      throw normalizeError(error)
    }
  }

  const url = `${API_BASE_URL}${path}${buildQuery(query)}`
  let response
  try {
    response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    throw new ApiError({ error_code: 'NETWORK_ERROR', message: error?.message })
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(data)
  return data
}
