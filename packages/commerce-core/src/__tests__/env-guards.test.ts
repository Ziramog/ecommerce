import test, { describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  isMockFallbackAllowed,
  assertLiveCommerceAvailable,
  ServiceUnavailableError,
} from '../config/env-guards'

describe('WOLFIM Commerce Core — Environment Guards & Fail-Closed Policies', () => {
  const originalEnv = process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK

  afterEach(() => {
    process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = originalEnv
  })

  test('isMockFallbackAllowed() returns false by default when variable is undefined', () => {
    delete process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK
    assert.equal(isMockFallbackAllowed(), false)
  })

  test('isMockFallbackAllowed() returns false when variable is "false"', () => {
    process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = 'false'
    assert.equal(isMockFallbackAllowed(), false)
  })

  test('isMockFallbackAllowed() returns true ONLY when variable is strictly "true"', () => {
    process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = 'true'
    assert.equal(isMockFallbackAllowed(), true)
  })

  test('assertLiveCommerceAvailable() throws ServiceUnavailableError when fallback is disallowed', () => {
    delete process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK
    assert.throws(
      () => {
        assertLiveCommerceAvailable(new Error('Connection refused'))
      },
      (err: any) => {
        assert.ok(err instanceof ServiceUnavailableError)
        assert.equal(err.statusCode, 503)
        assert.ok(err.message.includes('Comercio en vivo no disponible'))
        return true
      }
    )
  })

  test('assertLiveCommerceAvailable() does NOT throw when fallback is explicitly permitted', () => {
    process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = 'true'
    assert.doesNotThrow(() => {
      assertLiveCommerceAvailable(new Error('Connection refused'))
    })
  })
})
