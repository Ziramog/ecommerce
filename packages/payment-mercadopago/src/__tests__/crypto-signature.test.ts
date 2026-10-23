import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { validateMercadoPagoWebhookSignature } from '../utils/crypto-signature'

describe('WOLFIM Mercado Pago — HMAC-SHA256 Cryptographic Signature Verification', () => {
  const secret = 'test_webhook_secret_key_12345'
  const dataId = 'pay_987654321'
  const requestId = 'req_uuid_abc_123'

  function createValidSignature(ts: number, id: string, reqId: string, secretKey: string) {
    const manifest = `id:${id};request-id:${reqId};ts:${ts};`
    const hash = crypto.createHmac('sha256', secretKey).update(manifest).digest('hex')
    return `ts=${ts},v1=${hash}`
  }

  test('accepts valid x-signature with matching secret and current timestamp', () => {
    const ts = Date.now()
    const xSignature = createValidSignature(ts, dataId, requestId, secret)

    const res = validateMercadoPagoWebhookSignature({
      xSignature,
      xRequestId: requestId,
      dataId,
      webhookSecret: secret,
      maxTimeSkewSeconds: 300,
    })

    assert.equal(res.isValid, true)
    assert.equal(res.timestamp, ts)
  })

  test('accepts valid x-signature with timestamp provided in seconds', () => {
    const tsSeconds = Math.floor(Date.now() / 1000)
    const xSignature = createValidSignature(tsSeconds, dataId, requestId, secret)

    const res = validateMercadoPagoWebhookSignature({
      xSignature,
      xRequestId: requestId,
      dataId,
      webhookSecret: secret,
      maxTimeSkewSeconds: 300,
    })

    assert.equal(res.isValid, true)
  })

  test('rejects signature when HMAC hash does not match (wrong secret)', () => {
    const ts = Date.now()
    const xSignature = createValidSignature(ts, dataId, requestId, 'wrong_secret')

    const res = validateMercadoPagoWebhookSignature({
      xSignature,
      xRequestId: requestId,
      dataId,
      webhookSecret: secret,
    })

    assert.equal(res.isValid, false)
    assert.match(res.reason!, /no coincide/)
  })

  test('rejects signature when payload dataId has been tampered', () => {
    const ts = Date.now()
    const xSignature = createValidSignature(ts, 'pay_original_111', requestId, secret)

    const res = validateMercadoPagoWebhookSignature({
      xSignature,
      xRequestId: requestId,
      dataId: 'pay_tampered_222',
      webhookSecret: secret,
    })

    assert.equal(res.isValid, false)
  })

  test('rejects signature with expired timestamp (replay attack prevention)', () => {
    const expiredTs = Date.now() - 10 * 60 * 1000 // 10 minutes ago
    const xSignature = createValidSignature(expiredTs, dataId, requestId, secret)

    const res = validateMercadoPagoWebhookSignature({
      xSignature,
      xRequestId: requestId,
      dataId,
      webhookSecret: secret,
      maxTimeSkewSeconds: 300, // 5 min max
    })

    assert.equal(res.isValid, false)
    assert.match(res.reason!, /Firma expirada/)
  })

  test('rejects missing or malformed x-signature header', () => {
    const resEmpty = validateMercadoPagoWebhookSignature({
      xSignature: '',
      xRequestId: requestId,
      dataId,
      webhookSecret: secret,
    })
    assert.equal(resEmpty.isValid, false)

    const resMalformed = validateMercadoPagoWebhookSignature({
      xSignature: 'random_bad_format_string',
      xRequestId: requestId,
      dataId,
      webhookSecret: secret,
    })
    assert.equal(resMalformed.isValid, false)
    assert.match(resMalformed.reason!, /malformada/)
  })
})
