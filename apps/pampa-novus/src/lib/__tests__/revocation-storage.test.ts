import test, { describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { RevocationStorageService } from '../revocation-storage'

const TEST_DIR = path.resolve(process.cwd(), '.test_revocation_store')

describe('WOLFIM Botón de Arrepentimiento — Disposición 954/2025 Durable Storage', () => {
  let storage: RevocationStorageService

  beforeEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    }
    storage = new RevocationStorageService(TEST_DIR)
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    }
  })

  test('generates unique internal management claim ID (not public authority code)', () => {
    const id1 = storage.generateInternalClaimId()
    const id2 = storage.generateInternalClaimId()

    assert.ok(id1.startsWith('PN-REV-'))
    assert.ok(id2.startsWith('PN-REV-'))
    assert.notStrictEqual(id1, id2, 'Claim IDs must be uniquely generated')
  })

  test('registers claim durably, records audit trail and sets initial status', async () => {
    const claim = await storage.registerClaim({
      customer: {
        fullName: 'Juan Moreira',
        dniOrCuit: '20-12345678-9',
        email: 'moreira@campo.com.ar',
        phone: '+5491122334455',
      },
      order: {
        orderNumber: 'PN-2026-9901',
        deliveryDate: '2026-10-20',
        productsToRevoke: 'Montura Criolla de Trabajo SKU-CRI-001',
        reason: 'Preferencia de otro modelo',
      },
    })

    assert.ok(claim.claimId.startsWith('PN-REV-'))
    assert.strictEqual(claim.status, 'PENDING_OPERATOR_REVIEW')
    assert.strictEqual(claim.customer.fullName, 'Juan Moreira')
    assert.strictEqual(claim.legalFramework, 'DISPOSICION_954_2025_LEY_24240_ART_34')
    assert.strictEqual(claim.auditTrail.length, 2)
    assert.strictEqual(claim.auditTrail[0].action, 'CLAIM_SUBMITTED_BY_CONSUMER')
    assert.strictEqual(claim.operatorNotification.status, 'QUEUED')

    // Verificar persistencia en disco creando una nueva instancia del servicio
    const freshStorage = new RevocationStorageService(TEST_DIR)
    const retrieved = freshStorage.getClaimById(claim.claimId)
    assert.ok(retrieved)
    assert.strictEqual(retrieved?.customer.email, 'moreira@campo.com.ar')
    assert.strictEqual(retrieved?.order.orderNumber, 'PN-2026-9901')
  })

  test('updates status and appends operator audit trail for administrative traceability', async () => {
    const claim = await storage.registerClaim({
      customer: {
        fullName: 'Martín Fierro',
        dniOrCuit: '20-98765432-1',
        email: 'fierro@pampa.com.ar',
        phone: '+5491199887766',
      },
      order: {
        orderNumber: 'PN-2026-8802',
        deliveryDate: '2026-10-22',
        productsToRevoke: 'Bozal de Cuero Crudo SKU-DUAL-002',
      },
    })

    const updated = storage.updateStatus(
      claim.claimId,
      'GOODS_RETRIEVAL_SCHEDULED',
      'operador_logistica@mercadal.com.ar',
      'Retiro coordinado con Andreani para el 25/10 entre 10 y 14hs.'
    )

    assert.ok(updated)
    assert.strictEqual(updated?.status, 'GOODS_RETRIEVAL_SCHEDULED')
    assert.strictEqual(updated?.auditTrail.length, 3)
    assert.strictEqual(updated?.auditTrail[2].actor, 'operador_logistica@mercadal.com.ar')
    assert.ok(updated?.auditTrail[2].notes?.includes('Retiro coordinado'))
  })
})
