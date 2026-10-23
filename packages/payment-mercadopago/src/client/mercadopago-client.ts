/**
 * WOLFIM Commerce Core — Mercado Pago REST API Client
 * Secure wrapper for Checkout Pro Preferences and Payments APIs
 */
import type {
  MercadoPagoPreferencePayload,
  MercadoPagoPreferenceResponse,
  MercadoPagoPaymentRecord,
} from '../types/index.js'

export interface MercadoPagoClientConfig {
  accessToken: string
  sandbox?: boolean
  fetchFn?: typeof fetch
  baseUrl?: string
}

export class MercadoPagoClient {
  private readonly accessToken: string
  private readonly sandbox: boolean
  private readonly baseUrl: string
  private readonly fetchFn: typeof fetch

  constructor(config: MercadoPagoClientConfig) {
    if (!config.accessToken) {
      throw new Error('MercadoPagoClient requiere un accessToken válido.')
    }
    this.accessToken = config.accessToken
    this.sandbox = Boolean(config.sandbox)
    this.baseUrl = config.baseUrl || 'https://api.mercadopago.com'
    this.fetchFn = config.fetchFn || globalThis.fetch
  }

  /**
   * Creates a Checkout Pro preference on Mercado Pago
   */
  async createPreference(
    payload: MercadoPagoPreferencePayload
  ): Promise<MercadoPagoPreferenceResponse> {
    const url = `${this.baseUrl}/checkout/preferences`

    const response = await this.fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Error creando preferencia en Mercado Pago (HTTP ${response.status}): ${errorBody}`
      )
    }

    const data: any = await response.json()

    return {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point || data.init_point,
      external_reference: data.external_reference,
      date_created: data.date_created,
    }
  }

  /**
   * Queries a payment by ID directly from Mercado Pago server-to-server API
   */
  async getPayment(paymentId: string | number): Promise<MercadoPagoPaymentRecord> {
    const url = `${this.baseUrl}/v1/payments/${paymentId}`

    const response = await this.fetchFn(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Error consultando pago ${paymentId} en Mercado Pago (HTTP ${response.status}): ${errorBody}`
      )
    }

    const data: any = await response.json()

    return {
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      transaction_amount: Number(data.transaction_amount ?? 0),
      currency_id: data.currency_id,
      external_reference: data.external_reference,
      date_approved: data.date_approved,
      payment_method_id: data.payment_method_id,
      payment_type_id: data.payment_type_id,
    }
  }
}
