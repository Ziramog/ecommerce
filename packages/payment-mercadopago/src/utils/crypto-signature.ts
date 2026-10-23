/**
 * WOLFIM Commerce Core — Mercado Pago Webhook Cryptographic Verification
 * Validates HMAC-SHA256 signature from x-signature header
 */
import crypto from 'node:crypto'
import type {
  WebhookSignatureValidationInput,
  WebhookSignatureValidationResult,
} from '../types'

/**
 * Validates the authenticity of an incoming Mercado Pago Webhook notification.
 *
 * Header format: ts=1711234567,v1=9a8b7c6d5e4f...
 * Manifest template: id:[data.id];request-id:[x-request-id];ts:[ts];
 */
export function validateMercadoPagoWebhookSignature(
  input: WebhookSignatureValidationInput
): WebhookSignatureValidationResult {
  const {
    xSignature,
    xRequestId = '',
    dataId,
    webhookSecret,
    maxTimeSkewSeconds = 300, // 5 minutes default
  } = input

  if (!xSignature || !webhookSecret || !dataId) {
    return {
      isValid: false,
      reason: 'Faltan parámetros requeridos para la verificación criptográfica.',
    }
  }

  // Parse x-signature parts (ts=..., v1=...)
  const parts = xSignature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.trim().split('=')
    if (key && value) {
      acc[key.trim()] = value.trim()
    }
    return acc
  }, {})

  const tsString = parts.ts
  const v1Hash = parts.v1

  if (!tsString || !v1Hash) {
    return {
      isValid: false,
      reason: 'Cabecera x-signature malformada (debe contener ts y v1).',
    }
  }

  // Check timestamp skew (prevent replay attacks)
  const rawTs = Number(tsString)
  if (isNaN(rawTs) || rawTs <= 0) {
    return {
      isValid: false,
      reason: 'Timestamp de firma inválido.',
    }
  }

  // Normalize timestamp to milliseconds if provided in seconds
  const tsMs = rawTs < 10_000_000_000 ? rawTs * 1000 : rawTs
  const now = Date.now()
  const skewSeconds = Math.abs(now - tsMs) / 1000

  if (skewSeconds > maxTimeSkewSeconds) {
    return {
      isValid: false,
      reason: `Firma expirada: el timestamp presenta un desfase de ${Math.round(skewSeconds)}s (máximo permitido: ${maxTimeSkewSeconds}s).`,
      timestamp: tsMs,
    }
  }

  // Construct manifest string: "id:[data.id];request-id:[x-request-id];ts:[ts];"
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${tsString};`

  // Compute HMAC-SHA256
  const computedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex')

  // Constant-time comparison to prevent timing side-channel attacks
  try {
    const computedBuffer = Buffer.from(computedHash, 'hex')
    const receivedBuffer = Buffer.from(v1Hash, 'hex')

    if (computedBuffer.length !== receivedBuffer.length) {
      return {
        isValid: false,
        reason: 'Longitud de firma HMAC no coincide.',
        timestamp: tsMs,
      }
    }

    const matches = crypto.timingSafeEqual(computedBuffer, receivedBuffer)
    if (!matches) {
      return {
        isValid: false,
        reason: 'Firma HMAC-SHA256 no coincide con el secreto configurado.',
        timestamp: tsMs,
      }
    }

    return {
      isValid: true,
      timestamp: tsMs,
    }
  } catch (err: any) {
    return {
      isValid: false,
      reason: `Error evaluando buffers de firma: ${err?.message}`,
      timestamp: tsMs,
    }
  }
}
