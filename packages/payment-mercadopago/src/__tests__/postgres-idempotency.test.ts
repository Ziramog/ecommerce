import test, { describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  PostgresTransactionalIdempotencyStorage,
  MockTransactionalPostgresQueryRunner,
} from '../utils/postgres-idempotency'
import { ReconciliationManager } from '../utils/reconciliation'

describe('WOLFIM Mercado Pago — PostgreSQL Transactional Idempotency & Stale Lock Recovery', () => {
  let mockRunner: MockTransactionalPostgresQueryRunner
  let storage: PostgresTransactionalIdempotencyStorage
  let reconciliation: ReconciliationManager

  beforeEach(() => {
    mockRunner = new MockTransactionalPostgresQueryRunner()
    storage = new PostgresTransactionalIdempotencyStorage(mockRunner, 5)
    reconciliation = new ReconciliationManager()
  })

  test('acquireLock() inserts new row atomically and grants lock', async () => {
    const key = 'mp_evt:payment.created:pay_9001:approved'
    const locked = await storage.acquireLock(key, {
      key,
      status: 'processing',
      action: 'payment.created',
      paymentId: 'pay_9001',
      amount: 85000,
      currency: 'ARS',
      collectorId: '77889900',
      createdAt: Date.now(),
    })

    assert.strictEqual(locked, true, 'First lock attempt must succeed')

    const entry = await storage.get(key)
    assert.ok(entry)
    assert.strictEqual(entry?.status, 'processing')
    assert.strictEqual(entry?.paymentId, 'pay_9001')
    assert.strictEqual(entry?.amount, 85000)
    assert.strictEqual(entry?.currency, 'ARS')
  })

  test('acquireLock() rejects concurrent duplicate event arriving simultaneously', async () => {
    const key = 'mp_evt:payment.created:pay_9002:approved'

    // Primer hilo adquiere el lock
    const firstLock = await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9002',
      createdAt: Date.now(),
    })
    assert.strictEqual(firstLock, true)

    // Segundo hilo concurrente intenta el lock sobre el mismo key
    const secondLock = await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9002',
      createdAt: Date.now(),
    })
    assert.strictEqual(secondLock, false, 'Concurrent duplicate lock must be rejected')
  })

  test('markCompleted() sets status completed and permanently blocks duplicate processing', async () => {
    const key = 'mp_evt:payment.created:pay_9003:approved'

    await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9003',
      createdAt: Date.now(),
    })

    await storage.save(key, {
      key,
      status: 'completed',
      paymentId: 'pay_9003',
      createdAt: Date.now(),
      completedAt: Date.now(),
      result: { action: 'captured' },
    })

    const entry = await storage.get(key)
    assert.strictEqual(entry?.status, 'completed')

    // Intento posterior tras haber completado
    const subsequentLock = await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9003',
      createdAt: Date.now(),
    })
    assert.strictEqual(subsequentLock, false, 'Completed event must reject new locks permanently')
  })

  test('markFailed() allows safe subsequent retry and increments retry count', async () => {
    const key = 'mp_evt:payment.created:pay_9004:approved'

    // Intento 1: se adquiere lock y luego falla por caída de red
    await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9004',
      createdAt: Date.now(),
    })

    await storage.save(key, {
      key,
      status: 'failed',
      paymentId: 'pay_9004',
      error: 'ETIMEDOUT',
      createdAt: Date.now(),
    })

    const failedEntry = await storage.get(key)
    assert.strictEqual(failedEntry?.status, 'failed')

    // Intento 2: retransmisión legítima de Mercado Pago
    const retryLock = await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9004',
      createdAt: Date.now(),
    })

    assert.strictEqual(retryLock, true, 'Failed lock must be re-acquirable by subsequent retry')

    const raw = mockRunner.getRawData(key)
    assert.strictEqual(raw.retries, 1, 'Retry count must be incremented')
  })

  test('recovers interrupted operations when lock is stale (> 5 minutes timeout)', async () => {
    const key = 'mp_evt:payment.created:pay_9005:approved'

    // Iniciar lock
    await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9005',
      createdAt: Date.now(),
    })

    // Simular que el contenedor/proceso se reinició y el lock quedó colgado hace 10 minutos
    mockRunner.simulateInterruptedOperation(key, 10)

    // Intento de reintento: como pasaron 10 min (> 5 min timeout), el motor recupera la operación
    const recoveredLock = await storage.acquireLock(key, {
      key,
      status: 'processing',
      paymentId: 'pay_9005',
      createdAt: Date.now(),
    })

    assert.strictEqual(recoveredLock, true, 'Stale lock must be reclaimed for safe recovery')
    const raw = mockRunner.getRawData(key)
    assert.strictEqual(raw.retries, 1, 'Recovery must record retry increment')
  })

  test('reconciles orphan payments when captured in MP but order creation was interrupted', () => {
    const incident = reconciliation.recordOrphanPayment(
      'pay_orphan_1099',
      120000,
      'ARS',
      'El webhook de Mercado Pago confirmó el pago pero la base de datos de Medusa no respondió para crear la orden.',
      'cart_01M56B4ZCJSQGYBC'
    )

    assert.strictEqual(incident.discrepancyType, 'ORPHAN_CAPTURED_PAYMENT')
    assert.strictEqual(incident.paymentId, 'pay_orphan_1099')
    assert.strictEqual(incident.receivedAmount, 120000)
    assert.strictEqual(incident.receivedCurrency, 'ARS')
    assert.strictEqual(incident.resolved, false)
    assert.ok(incident.details.includes('Cobro confirmado en Mercado Pago sin orden'))
  })
})
