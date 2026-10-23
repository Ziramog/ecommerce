import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { MercadoPagoPaymentProvider } from '../services/mercadopago-provider.js'
import { PaymentActions, PaymentSessionStatus } from '@medusajs/framework/utils'

describe('WOLFIM Mercado Pago — Payment Provider Service (Medusa 2.21.2)', () => {
  const webhookSecret = 'sec_test_wolfim_mp_secret_key'
  const merchantCollectorId = '77889900'

  // Deterministic mock client
  const paymentDb: Record<string, any> = {
    'pay_1001': {
      id: 'pay_1001',
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 85000,
      currency_id: 'ARS',
      collector_id: merchantCollectorId,
      external_reference: 'cart_test_pampa',
      date_approved: new Date().toISOString(),
    },
    'pay_1002': {
      id: 'pay_1002',
      status: 'pending',
      status_detail: 'pending_contingency',
      transaction_amount: 54000,
      currency_id: 'ARS',
      collector_id: merchantCollectorId,
      external_reference: 'cart_test_pending',
    },
    'pay_1003': {
      id: 'pay_1003',
      status: 'rejected',
      status_detail: 'cc_rejected_insufficient_amount',
      transaction_amount: 120000,
      currency_id: 'ARS',
      collector_id: merchantCollectorId,
      external_reference: 'cart_test_rejected',
    },
    'pay_currency_mismatch': {
      id: 'pay_currency_mismatch',
      status: 'approved',
      transaction_amount: 100,
      currency_id: 'USD', // Invalid: not ARS
      collector_id: merchantCollectorId,
      external_reference: 'cart_fraud_usd',
    },
    'pay_collector_mismatch': {
      id: 'pay_collector_mismatch',
      status: 'approved',
      transaction_amount: 85000,
      currency_id: 'ARS',
      collector_id: '66666666', // Spoofed: not merchant collector ID
      external_reference: 'cart_spoofed',
    },
    'pay_amount_mismatch': {
      id: 'pay_amount_mismatch',
      status: 'approved',
      transaction_amount: 100, // Expected 85000
      currency_id: 'ARS',
      collector_id: merchantCollectorId,
      external_reference: 'cart_amount_fraud',
    },
  }

  let s2sQueryCount = 0

  const mockClient: any = {
    createPreference: async (payload: any) => ({
      id: 'pref_mock_9999',
      init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_mock_9999',
      sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_mock_9999',
      external_reference: payload.external_reference,
      date_created: new Date().toISOString(),
    }),
    getPayment: async (paymentId: string | number) => {
      s2sQueryCount++
      const record = paymentDb[String(paymentId)]
      if (!record) {
        throw new Error(`Payment ${paymentId} not found`)
      }
      return record
    },
  }

  function signPayload(ts: number, dataId: string, reqId: string) {
    const manifest = `id:${dataId};request-id:${reqId};ts:${ts};`
    const hash = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex')
    return `ts=${ts},v1=${hash}`
  }

  const provider = new MercadoPagoPaymentProvider(
    {},
    {
      accessToken: 'TEST-ACCESS-TOKEN-MERCADAL',
      webhookSecret,
      collectorId: merchantCollectorId,
      sandbox: true,
      statementDescriptor: 'PAMPA NOVUS',
      backUrls: {
        success: 'https://pampanovus.com.ar/checkout?status=success',
        pending: 'https://pampanovus.com.ar/checkout?status=pending',
        failure: 'https://pampanovus.com.ar/checkout?status=failure',
      },
    },
    mockClient
  )

  test('validateOptions() throws if accessToken is missing', () => {
    assert.throws(() => {
      MercadoPagoPaymentProvider.validateOptions({})
    }, /accessToken/)
  })

  test('initiatePayment() generates Checkout Pro preference and returns init_point', async () => {
    const res = await provider.initiatePayment({
      amount: 85000,
      currency_code: 'ars',
      data: { session_id: 'sess_mp_01' },
      context: {
        cart_id: 'cart_pampa_001',
        customer: {
          id: 'cust_01',
          email: 'cliente@mercadal.com.ar',
          first_name: 'Martín',
          last_name: 'Fierro',
        },
      },
    })

    assert.equal(res.id, 'pref_mock_9999')
    assert.equal(res.data?.amount, 85000)
    assert.equal(res.data?.currency_code, 'ARS')
    assert.equal(res.data?.status, PaymentSessionStatus.PENDING)
    assert.ok((res.data?.init_point as string).includes('sandbox.mercadopago.com.ar'))
  })

  test('authorizePayment() verifies payment server-to-server and marks CAPTURED when approved', async () => {
    const res = await provider.authorizePayment({
      data: {
        payment_id: 'pay_1001',
        amount: 85000,
      },
    })

    assert.equal(res.status, PaymentSessionStatus.CAPTURED)
    assert.equal(res.data?.status, 'approved')
    assert.equal(res.data?.transaction_amount, 85000)
  })

  test('authorizePayment() rejects payment with CURRENCY_MISMATCH and records incident', async () => {
    const res = await provider.authorizePayment({
      data: {
        payment_id: 'pay_currency_mismatch',
        amount: 100,
      },
    })

    assert.equal(res.status, PaymentSessionStatus.ERROR)
    assert.equal(res.data?.status, 'error_currency_mismatch')

    const incidents = provider.getReconciliationManager().listIncidents()
    const match = incidents.find((inc) => inc.paymentId === 'pay_currency_mismatch')
    assert.ok(match)
    assert.equal(match?.discrepancyType, 'CURRENCY_MISMATCH')
  })

  test('authorizePayment() rejects payment with COLLECTOR_MISMATCH (anti-spoofing)', async () => {
    const res = await provider.authorizePayment({
      data: {
        payment_id: 'pay_collector_mismatch',
        amount: 85000,
      },
    })

    assert.equal(res.status, PaymentSessionStatus.ERROR)
    assert.equal(res.data?.status, 'error_collector_mismatch')

    const incidents = provider.getReconciliationManager().listIncidents()
    const match = incidents.find((inc) => inc.paymentId === 'pay_collector_mismatch')
    assert.ok(match)
    assert.equal(match?.discrepancyType, 'COLLECTOR_MISMATCH')
  })

  test('authorizePayment() rejects payment with AMOUNT_MISMATCH', async () => {
    const res = await provider.authorizePayment({
      data: {
        payment_id: 'pay_amount_mismatch',
        amount: 85000, // Expected 85000, but charged 100
      },
    })

    assert.equal(res.status, PaymentSessionStatus.ERROR)
    assert.equal(res.data?.status, 'error_amount_mismatch')

    const incidents = provider.getReconciliationManager().listIncidents()
    const match = incidents.find((inc) => inc.paymentId === 'pay_amount_mismatch')
    assert.ok(match)
    assert.equal(match?.discrepancyType, 'AMOUNT_MISMATCH')
  })

  test('authorizePayment() marks PENDING when payment is in process', async () => {
    const res = await provider.authorizePayment({
      data: {
        payment_id: 'pay_1002',
      },
    })

    assert.equal(res.status, PaymentSessionStatus.PENDING)
    assert.equal(res.data?.status, 'pending')
  })

  test('authorizePayment() marks ERROR when payment is rejected', async () => {
    const res = await provider.authorizePayment({
      data: {
        payment_id: 'pay_1003',
      },
    })

    assert.equal(res.status, PaymentSessionStatus.ERROR)
    assert.equal(res.data?.status, 'rejected')
  })

  test('getWebhookActionAndData() validates signature, performs S2S check and returns SUCCESSFUL for approved payment', async () => {
    const ts = Date.now()
    const reqId = 'req_test_webhook_1'
    const dataId = 'pay_1001'
    const xSignature = signPayload(ts, dataId, reqId)

    const initialCount = s2sQueryCount

    const res = await provider.getWebhookActionAndData({
      headers: {
        'x-signature': xSignature,
        'x-request-id': reqId,
      },
      data: {
        id: dataId,
        action: 'payment.created',
        type: 'payment',
      },
    })

    assert.equal(res.action, PaymentActions.SUCCESSFUL)
    assert.equal(res.data?.amount, 85000)
    assert.equal((res.data as any)?.payment_id, 'pay_1001')
    assert.equal(s2sQueryCount, initialCount + 1)
  })

  test('getWebhookActionAndData() deduplicates duplicate webhook without repeating S2S inquiry', async () => {
    const ts = Date.now()
    const reqId = 'req_test_webhook_dup'
    const dataId = 'pay_1001'
    const xSignature = signPayload(ts, dataId, reqId)

    const countBefore = s2sQueryCount

    // First delivery
    const res1 = await provider.getWebhookActionAndData({
      headers: {
        'x-signature': xSignature,
        'x-request-id': reqId,
      },
      data: {
        id: dataId,
        action: 'payment.created',
      },
    })
    assert.equal(res1.action, PaymentActions.SUCCESSFUL)

    // Immediate duplicate retransmission from Mercado Pago
    const res2 = await provider.getWebhookActionAndData({
      headers: {
        'x-signature': xSignature,
        'x-request-id': reqId,
      },
      data: {
        id: dataId,
        action: 'payment.created',
      },
    })

    assert.equal(res2.action, PaymentActions.SUCCESSFUL)
    assert.equal((res2.data as any)?.deduplicated, true)
    // Verify that S2S query was not called a second time
    assert.equal(s2sQueryCount, countBefore + 1)
  })

  test('getWebhookActionAndData() rejects webhook when signature is invalid', async () => {
    await assert.rejects(
      async () => {
        await provider.getWebhookActionAndData({
          headers: {
            'x-signature': 'ts=1700000000,v1=fake_signature',
            'x-request-id': 'req_tampered',
          },
          data: {
            id: 'pay_1001',
            action: 'payment.created',
          },
        })
      },
      /Webhook Mercado Pago inválido/
    )
  })
})
