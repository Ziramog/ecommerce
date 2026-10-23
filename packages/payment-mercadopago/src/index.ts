/**
 * WOLFIM Commerce Core — Mercado Pago Adapter Module
 */
export * from './types/index.js'
export * from './client/mercadopago-client.js'
export * from './utils/crypto-signature.js'
export * from './utils/idempotency.js'
export * from './utils/reconciliation.js'
export * from './services/mercadopago-provider.js'

import { MercadoPagoPaymentProvider } from './services/mercadopago-provider.js'
export default MercadoPagoPaymentProvider
