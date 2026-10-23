/**
 * WOLFIM Commerce Core — Mercado Pago Adapter Types
 * Fully decoupled contracts for Medusa 2.21.2 Payment Module
 */

export interface MercadoPagoProviderOptions {
  accessToken: string
  webhookSecret?: string
  collectorId?: string | number
  sandbox?: boolean
  idempotencyStoragePath?: string
  reconciliationAuditLogPath?: string
  backUrls?: {
    success: string
    pending: string
    failure: string
  }
  autoReturn?: 'approved' | 'all'
  statementDescriptor?: string
}

export interface MercadoPagoPreferenceItem {
  id: string
  title: string
  unit_price: number
  quantity: number
  currency_id: string
  picture_url?: string
  description?: string
}

export interface MercadoPagoPayer {
  name?: string
  surname?: string
  email: string
  phone?: {
    area_code?: string
    number?: string
  }
  identification?: {
    type: 'DNI' | 'CUIT' | 'CUIL' | 'PASSPORT' | string
    number: string
  }
  address?: {
    street_name?: string
    street_number?: number
    zip_code?: string
  }
}

export interface MercadoPagoPreferencePayload {
  items: MercadoPagoPreferenceItem[]
  payer?: MercadoPagoPayer
  back_urls?: {
    success: string
    pending: string
    failure: string
  }
  auto_return?: 'approved' | 'all'
  external_reference: string
  statement_descriptor?: string
  notification_url?: string
  metadata?: Record<string, any>
}

export interface MercadoPagoPreferenceResponse {
  id: string
  init_point: string
  sandbox_init_point: string
  external_reference: string
  date_created: string
}

export type MercadoPagoPaymentStatus =
  | 'approved'
  | 'pending'
  | 'in_process'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back'

export interface MercadoPagoPaymentRecord {
  id: number | string
  status: MercadoPagoPaymentStatus
  status_detail: string
  transaction_amount: number
  currency_id: string
  external_reference: string
  collector_id?: string | number
  date_approved?: string
  payment_method_id?: string
  payment_type_id?: string
}

export interface WebhookSignatureValidationInput {
  xSignature: string
  xRequestId?: string
  dataId: string
  webhookSecret: string
  maxTimeSkewSeconds?: number
}

export interface WebhookSignatureValidationResult {
  isValid: boolean
  reason?: string
  timestamp?: number
}
