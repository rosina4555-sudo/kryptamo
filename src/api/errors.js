export class ApiError extends Error {
  constructor({ error_code = 'UNKNOWN_ERROR', message, details = null } = {}) {
    super(message || errorMessages[error_code] || 'Something went wrong.')
    this.name = 'ApiError'
    this.error_code = error_code
    this.details = details
  }
}

export const errorMessages = {
  USER_NOT_FOUND: 'We couldn’t find that username. Check the spelling, or ask them for their username.',
  MOMO_LOOKUP_FAILED:
    'We couldn’t verify this Mobile Money account. It may be inactive. Ask them to check it before you send.',
  QUOTE_EXPIRED: 'This rate has expired. Get a new quote to continue.',
  LIMIT_EXCEEDED: 'This is above your daily limit. Send a smaller amount or try again tomorrow.',
  INVALID_CREDENTIALS: 'That email or username and password don’t match.',
  USERNAME_TAKEN: 'That username is already taken.',
  EMAIL_TAKEN: 'That email is already registered.',
  VALIDATION_ERROR: 'Check the highlighted fields and try again.',
  NETWORK_ERROR: 'We can’t reach Kryptamo. Check your connection. We’ll try again automatically.',
}

export function normalizeError(error) {
  if (error instanceof ApiError) return error
  if (error && error.error_code) return new ApiError(error)
  return new ApiError({ error_code: 'NETWORK_ERROR', message: error?.message })
}
