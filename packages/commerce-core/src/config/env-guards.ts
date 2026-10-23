/**
 * WOLFIM Commerce Core — Environment Guards & Fail-Closed Policies
 *
 * Implements strict fail-closed protection against mock products / test data leaking into production.
 * By default, mock fallbacks are completely forbidden unless explicitly enabled via
 * NEXT_PUBLIC_ALLOW_MOCK_FALLBACK === 'true' (strictly for local offline prototyping).
 */

export class ServiceUnavailableError extends Error {
  public readonly code = 'SERVICE_UNAVAILABLE'
  public readonly statusCode = 503

  constructor(message: string = 'El servicio de catálogo y comercio en vivo no está disponible.') {
    super(message)
    this.name = 'ServiceUnavailableError'
  }
}

/**
 * Checks whether mock/fallback data is permitted in the current runtime environment.
 * Strict Fail-Closed Rule:
 * Returns true ONLY if NEXT_PUBLIC_ALLOW_MOCK_FALLBACK === 'true'.
 * In production or whenever unspecified, returns false.
 */
export function isMockFallbackAllowed(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false
  }

  // Explicit environment variable takes precedence
  const allowMock = process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK
  if (allowMock === 'true') {
    return true
  }

  return false
}

/**
 * Asserts that live commerce backend is available.
 * If backend fails and mocks are not explicitly allowed, throws ServiceUnavailableError.
 */
export function assertLiveCommerceAvailable(errorDetail?: unknown): void {
  if (isMockFallbackAllowed()) {
    return
  }

  const detail = errorDetail instanceof Error ? errorDetail.message : String(errorDetail || '')
  throw new ServiceUnavailableError(
    `Comercio en vivo no disponible y datos simulados bloqueados por política de producción.${
      detail ? ` Detalle: ${detail}` : ''
    }`
  )
}
