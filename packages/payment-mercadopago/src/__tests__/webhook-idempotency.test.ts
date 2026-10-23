import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  WebhookIdempotencyManager,
  FilePersistentIdempotencyStorage,
  MemoryIdempotencyStorage,
} from '../utils/idempotency.js'

describe('WOLFIM Mercado Pago — Webhook Idempotency & Deduplication', () => {
  test('acquires lock on first occurrence of an event key (in-memory)', async () => {
    const manager = new WebhookIdempotencyManager({ storage: new MemoryIdempotencyStorage() })
    const key = manager.buildKey('payment.created', 'pay_123', 'approved')

    const acquired = await manager.acquireLock(key)
    assert.equal(acquired, true)
  })

  test('rejects lock acquisition on duplicate concurrent notification', async () => {
    const manager = new WebhookIdempotencyManager()
    const key = manager.buildKey('payment.updated', 'pay_456', 'approved')

    const first = await manager.acquireLock(key)
    const second = await manager.acquireLock(key)

    assert.equal(first, true)
    assert.equal(second, false)
  })

  test('keeps completed status after markCompleted and rejects new lock', async () => {
    const manager = new WebhookIdempotencyManager()
    const key = manager.buildKey('payment.updated', 'pay_789', 'approved')

    await manager.acquireLock(key)
    await manager.markCompleted(key, { orderId: 'ord_123' })

    assert.equal(await manager.isCompleted(key), true)
    assert.equal(await manager.acquireLock(key), false)
  })

  test('markFailed releases lock allowing subsequent retry', async () => {
    const manager = new WebhookIdempotencyManager()
    const key = manager.buildKey('payment.updated', 'pay_retry', 'approved')

    await manager.acquireLock(key)
    await manager.markFailed(key, 'NETWORK_TIMEOUT')

    // After failure, retransmission should acquire lock
    assert.equal(await manager.acquireLock(key), true)
  })

  test('survives backend process restart using FilePersistentIdempotencyStorage', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idempotency-test-'))
    const tempFilePath = path.join(tempDir, 'idempotency-store.json')

    try {
      // 1. First "Instance" processes an event and completes it
      const storage1 = new FilePersistentIdempotencyStorage(tempFilePath)
      const manager1 = new WebhookIdempotencyManager({ storage: storage1 })
      const key = manager1.buildKey('payment.created', 'pay_restart_999', 'approved')

      const locked1 = await manager1.acquireLock(key, { amount: 85000, paymentId: 'pay_restart_999' })
      assert.equal(locked1, true)
      await manager1.markCompleted(key, { orderId: 'ord_completed_before_restart' })

      // File should now physically exist on disk
      assert.equal(fs.existsSync(tempFilePath), true)

      // 2. Simulate Backend Crash / Restart: New instance created pointing to same storage
      const storage2 = new FilePersistentIdempotencyStorage(tempFilePath)
      const manager2 = new WebhookIdempotencyManager({ storage: storage2 })

      // 3. Duplicate retransmitted webhook arrives after restart
      const lockedAfterRestart = await manager2.acquireLock(key)
      assert.equal(lockedAfterRestart, false, 'Durable storage must reject duplicate after restart')
      assert.equal(await manager2.isCompleted(key), true)

      const entry = await manager2.getEntry(key)
      assert.equal(entry?.status, 'completed')
      assert.equal(entry?.paymentId, 'pay_restart_999')
    } finally {
      // Clean up temporary files
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath)
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir)
    }
  })
})
