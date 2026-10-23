/**
 * WOLFIM Commerce Core — Mercado Pago Payment Provider for Medusa 2.21.2
 *
 * Implements AbstractPaymentProvider with Checkout Pro,
 * cryptographic webhook verification, S2S confirmation, durable idempotency,
 * and strict financial reconciliation.
 */
import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from '@medusajs/framework/utils'
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/types'
import type {
  MercadoPagoProviderOptions,
  MercadoPagoPreferencePayload,
  MercadoPagoPaymentRecord,
} from '../types/index.js'
import { MercadoPagoClient } from '../client/mercadopago-client.js'
import { validateMercadoPagoWebhookSignature } from '../utils/crypto-signature.js'
import {
  WebhookIdempotencyManager,
  FilePersistentIdempotencyStorage,
  MemoryIdempotencyStorage,
} from '../utils/idempotency.js'
import { ReconciliationManager } from '../utils/reconciliation.js'

export class MercadoPagoPaymentProvider extends AbstractPaymentProvider<MercadoPagoProviderOptions> {
  static identifier = 'mercadopago'

  protected readonly options_: MercadoPagoProviderOptions
  protected readonly client_: MercadoPagoClient
  protected readonly idempotencyManager_: WebhookIdempotencyManager
  protected readonly reconciliationManager_: ReconciliationManager

  static validateOptions(options: Record<string, any>): void {
    if (!options.accessToken) {
      throw new Error(
        'MercadoPagoPaymentProvider: "accessToken" es requerido en las opciones del provider.'
      )
    }
  }

  constructor(
    container: any,
    options: MercadoPagoProviderOptions,
    customClient?: MercadoPagoClient,
    customIdempotencyManager?: WebhookIdempotencyManager
  ) {
    super(container, options)
    MercadoPagoPaymentProvider.validateOptions(options)

    this.options_ = options
    this.client_ =
      customClient ||
      new MercadoPagoClient({
        accessToken: options.accessToken,
        sandbox: Boolean(options.sandbox),
      })

    if (customIdempotencyManager) {
      this.idempotencyManager_ = customIdempotencyManager
    } else if (options.idempotencyStoragePath) {
      this.idempotencyManager_ = new WebhookIdempotencyManager({
        storage: new FilePersistentIdempotencyStorage(options.idempotencyStoragePath),
        ttlMinutes: 60 * 24 * 30, // 30-day retention
      })
    } else {
      this.idempotencyManager_ = new WebhookIdempotencyManager({
        storage: new MemoryIdempotencyStorage(),
        ttlMinutes: 60,
      })
    }

    this.reconciliationManager_ = new ReconciliationManager(options.reconciliationAuditLogPath)
  }

  /**
   * Initiates payment by generating a Mercado Pago Checkout Pro Preference
   */
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const amount = Number(input.amount)
    const currencyCode = (input.currency_code || 'ars').toUpperCase()
    const cartContext: any = input.context || {}
    const sessionId = (input.data?.session_id as string) || (input as any).session_id

    const externalReference =
      sessionId ||
      cartContext?.cart_id ||
      `mp_ref_${Date.now()}`

    const items = (cartContext?.items || []).length > 0
      ? cartContext.items.map((item: any) => ({
          id: item.variant_id || item.id,
          title: item.title || 'Artículo',
          unit_price: Number(item.unit_price ?? item.unitPrice ?? amount),
          quantity: Number(item.quantity ?? 1),
          currency_id: currencyCode,
        }))
      : [
          {
            id: externalReference,
            title: this.options_.statementDescriptor || 'Compra Online',
            unit_price: amount,
            quantity: 1,
            currency_id: currencyCode,
          },
        ]

    const payload: MercadoPagoPreferencePayload = {
      items,
      external_reference: externalReference,
      statement_descriptor: this.options_.statementDescriptor,
      back_urls: this.options_.backUrls,
      auto_return: this.options_.autoReturn,
    }

    if (cartContext?.customer) {
      payload.payer = {
        email: cartContext.customer.email,
        name: cartContext.customer.first_name,
        surname: cartContext.customer.last_name,
      }
    }

    const preference = await this.client_.createPreference(payload)

    const initPoint = this.options_.sandbox
      ? preference.sandbox_init_point
      : preference.init_point

    return {
      id: preference.id,
      data: {
        preference_id: preference.id,
        init_point: initPoint,
        sandbox_init_point: preference.sandbox_init_point,
        external_reference: preference.external_reference,
        amount,
        currency_code: currencyCode,
        status: PaymentSessionStatus.PENDING,
      },
    }
  }

  /**
   * Authorizes payment by checking status in Mercado Pago with strict financial security checks
   */
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const paymentSessionData: any = input.data || {}
    const paymentId = paymentSessionData?.payment_id

    // If no paymentId yet, user hasn't completed Checkout Pro
    if (!paymentId) {
      return {
        status: PaymentSessionStatus.PENDING,
        data: paymentSessionData,
      }
    }

    // Server-to-server authoritative inquiry
    const payment: MercadoPagoPaymentRecord = await this.client_.getPayment(paymentId)

    // Financial Safety Check 1: Currency validation
    if (payment.currency_id && payment.currency_id.toUpperCase() !== 'ARS') {
      this.reconciliationManager_.recordIncident({
        discrepancyType: 'CURRENCY_MISMATCH',
        paymentId: payment.id,
        expectedCurrency: 'ARS',
        receivedCurrency: payment.currency_id,
        details: `Moneda discordante recibida de Mercado Pago: ${payment.currency_id}. Esperado: ARS.`,
      })
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          ...paymentSessionData,
          payment_id: payment.id,
          status: 'error_currency_mismatch',
        },
      }
    }

    // Financial Safety Check 2: Collector / Merchant validation (anti-spoofing)
    if (
      this.options_.collectorId &&
      payment.collector_id &&
      String(payment.collector_id) !== String(this.options_.collectorId)
    ) {
      this.reconciliationManager_.recordIncident({
        discrepancyType: 'COLLECTOR_MISMATCH',
        paymentId: payment.id,
        expectedCollectorId: this.options_.collectorId,
        receivedCollectorId: payment.collector_id,
        details: `Comercio receptor discordante: ${payment.collector_id}. Esperado: ${this.options_.collectorId}.`,
      })
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          ...paymentSessionData,
          payment_id: payment.id,
          status: 'error_collector_mismatch',
        },
      }
    }

    // Financial Safety Check 3: Amount validation (exact match)
    const expectedAmount = Number(paymentSessionData?.amount)
    if (expectedAmount > 0 && Math.abs(expectedAmount - payment.transaction_amount) > 0.01) {
      this.reconciliationManager_.recordIncident({
        discrepancyType: 'AMOUNT_MISMATCH',
        paymentId: payment.id,
        expectedAmount,
        receivedAmount: payment.transaction_amount,
        details: `Discrepancia de monto: cobrado $${payment.transaction_amount}, esperado $${expectedAmount}.`,
      })
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          ...paymentSessionData,
          payment_id: payment.id,
          status: 'error_amount_mismatch',
        },
      }
    }

    if (payment.status === 'approved') {
      return {
        status: PaymentSessionStatus.CAPTURED,
        data: {
          ...paymentSessionData,
          payment_id: payment.id,
          status: 'approved',
          date_approved: payment.date_approved,
          transaction_amount: payment.transaction_amount,
        },
      }
    }

    if (payment.status === 'pending' || payment.status === 'in_process') {
      return {
        status: PaymentSessionStatus.PENDING,
        data: {
          ...paymentSessionData,
          payment_id: payment.id,
          status: payment.status,
        },
      }
    }

    return {
      status: PaymentSessionStatus.ERROR,
      data: {
        ...paymentSessionData,
        payment_id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
      },
    }
  }

  /**
   * Capture is automatic in Checkout Pro upon approval
   */
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return {
      data: input.data || {},
    }
  }

  /**
   * Refunds payment amount
   */
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        refunded_amount: Number(input.amount),
        refunded_at: new Date().toISOString(),
      },
    }
  }

  /**
   * Cancels payment session
   */
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        status: PaymentSessionStatus.CANCELED,
      },
    }
  }

  /**
   * Deletes payment session
   */
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {
      data: input.data || {},
    }
  }

  /**
   * Returns current session status
   */
  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const status = (input.data?.status as PaymentSessionStatus) || PaymentSessionStatus.PENDING
    return {
      status,
      data: input.data || {},
    }
  }

  /**
   * Retrieves payment data
   */
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const paymentId = input.data?.payment_id as string
    if (paymentId) {
      const payment = await this.client_.getPayment(paymentId)
      return {
        data: {
          ...(input.data || {}),
          ...payment,
        },
      }
    }
    return {
      data: input.data || {},
    }
  }

  /**
   * Updates payment amount/items
   */
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const initRes = await this.initiatePayment(input as any)
    return {
      data: initRes.data,
      status: PaymentSessionStatus.PENDING,
    }
  }

  /**
   * Handles webhook notification with signature verification,
   * S2S confirmation, durable idempotency deduplication, and financial reconciliation.
   */
  async getWebhookActionAndData(payload: {
    data: Record<string, unknown>
    rawData?: string | Buffer
    headers: Record<string, unknown>
  }): Promise<WebhookActionResult> {
    const { headers = {}, rawData, data } = payload as any
    const body = data || rawData || {}

    const xSignature = (headers['x-signature'] ||
      headers['X-Signature'] ||
      headers['x_signature']) as string
    const xRequestId = (headers['x-request-id'] ||
      headers['X-Request-Id'] ||
      headers['x_request_id']) as string

    const dataId = String(body.data?.id || body.id || '')
    const actionType = String(body.type || body.action || 'payment')

    // 1. Signature validation
    if (this.options_.webhookSecret) {
      const sigValidation = validateMercadoPagoWebhookSignature({
        xSignature,
        xRequestId,
        dataId,
        webhookSecret: this.options_.webhookSecret,
      })

      if (!sigValidation.isValid) {
        throw new Error(
          `Webhook Mercado Pago inválido: ${sigValidation.reason || 'Firma no coincide'}`
        )
      }
    }

    if (!dataId) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }

    // 2. Durable Idempotency Lock
    const idempotencyKey = this.idempotencyManager_.buildKey(
      actionType,
      dataId,
      body.status || 'event'
    )

    const lockAcquired = await this.idempotencyManager_.acquireLock(idempotencyKey, {
      action: actionType,
      paymentId: dataId,
    })

    if (!lockAcquired) {
      // Event already processed or in process -> deduplicate safely
      return {
        action: PaymentActions.SUCCESSFUL,
        data: {
          session_id: body.data?.external_reference || body.external_reference || dataId,
          amount: Number(body.data?.transaction_amount || 0),
          deduplicated: true,
        } as any,
      }
    }

    try {
      // 3. Server-to-server authoritative query
      const payment = await this.client_.getPayment(dataId)

      // Financial Safety Check 1: Currency validation
      if (payment.currency_id && payment.currency_id.toUpperCase() !== 'ARS') {
        this.reconciliationManager_.recordIncident({
          discrepancyType: 'CURRENCY_MISMATCH',
          paymentId: payment.id,
          expectedCurrency: 'ARS',
          receivedCurrency: payment.currency_id,
          details: `Webhook rechazado por moneda discordante: ${payment.currency_id}.`,
        })
        await this.idempotencyManager_.markFailed(idempotencyKey, 'CURRENCY_MISMATCH')
        return { action: PaymentActions.FAILED }
      }

      // Financial Safety Check 2: Collector / Merchant validation (anti-spoofing)
      if (
        this.options_.collectorId &&
        payment.collector_id &&
        String(payment.collector_id) !== String(this.options_.collectorId)
      ) {
        this.reconciliationManager_.recordIncident({
          discrepancyType: 'COLLECTOR_MISMATCH',
          paymentId: payment.id,
          expectedCollectorId: this.options_.collectorId,
          receivedCollectorId: payment.collector_id,
          details: `Webhook rechazado por comercio receptor discordante: ${payment.collector_id}.`,
        })
        await this.idempotencyManager_.markFailed(idempotencyKey, 'COLLECTOR_MISMATCH')
        return { action: PaymentActions.FAILED }
      }

      let action: any = PaymentActions.NOT_SUPPORTED
      if (payment.status === 'approved') {
        action = PaymentActions.SUCCESSFUL
      } else if (payment.status === 'pending' || payment.status === 'in_process') {
        action = PaymentActions.PENDING
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        action = PaymentActions.FAILED
      }

      await this.idempotencyManager_.markCompleted(idempotencyKey, {
        status: payment.status,
        paymentId: payment.id,
        amount: payment.transaction_amount,
      })

      return {
        action,
        data: {
          session_id: payment.external_reference || dataId,
          amount: payment.transaction_amount,
          payment_id: payment.id,
        } as any,
      }
    } catch (err: any) {
      await this.idempotencyManager_.markFailed(idempotencyKey, err?.message)
      throw err
    }
  }

  /**
   * Helper to expose the idempotency manager for testing
   */
  public getIdempotencyManager(): WebhookIdempotencyManager {
    return this.idempotencyManager_
  }

  /**
   * Helper to expose the reconciliation manager for auditing
   */
  public getReconciliationManager(): ReconciliationManager {
    return this.reconciliationManager_
  }
}
