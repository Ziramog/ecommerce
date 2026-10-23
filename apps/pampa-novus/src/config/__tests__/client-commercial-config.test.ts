import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  CLIENT_COMMERCIAL_CONFIG,
  assertProductionCommercialReadiness,
  type ClientCommercialConfig,
} from '../client-commercial-config'

describe('WOLFIM Client Commercial Configuration — Governance & Guards', () => {
  test('CLIENT_COMMERCIAL_CONFIG strictly disallows unconfirmed interest-free installments', () => {
    assert.strictEqual(
      CLIENT_COMMERCIAL_CONFIG.financialPromotions.interestFreeAllowed.value,
      false,
      'interestFreeAllowed must remain false until banking subsidy agreement is confirmed'
    )
  })

  test('assertProductionCommercialReadiness identifies pending unapproved fields in current config', () => {
    const result = assertProductionCommercialReadiness(CLIENT_COMMERCIAL_CONFIG, false)

    assert.strictEqual(result.ready, false)
    assert.ok(result.unapprovedFields.length > 0)
    assert.ok(
      result.unapprovedFields.some((f) => f.includes('cuit')),
      'Must identify unapproved CUIT'
    )
    assert.ok(
      result.unapprovedFields.some((f) => f.includes('showroomAddress')),
      'Must identify unapproved showroom address'
    )
  })

  test('assertProductionCommercialReadiness throws in strict production mode if unapproved fields exist', () => {
    assert.throws(
      () => {
        assertProductionCommercialReadiness(CLIENT_COMMERCIAL_CONFIG, true)
      },
      (err: Error) => {
        assert.ok(err.message.includes('[FAIL-CLOSED COMMERCIAL GUARD]'))
        assert.ok(err.message.includes('Talabartería Mercadal S.A.'))
        return true
      }
    )
  })

  test('assertProductionCommercialReadiness succeeds when all mandatory fields are approved', () => {
    // Simular configuración completamente aprobada por Mercadal
    const approvedConfig: ClientCommercialConfig = {
      ...CLIENT_COMMERCIAL_CONFIG,
      company: {
        ...CLIENT_COMMERCIAL_CONFIG.company,
        legalName: { ...CLIENT_COMMERCIAL_CONFIG.company.legalName, status: 'APPROVED' },
        cuit: { ...CLIENT_COMMERCIAL_CONFIG.company.cuit, status: 'APPROVED' },
        showroomAddress: { ...CLIENT_COMMERCIAL_CONFIG.company.showroomAddress, status: 'APPROVED' },
      },
      contact: {
        ...CLIENT_COMMERCIAL_CONFIG.contact,
        phoneFormatted: { ...CLIENT_COMMERCIAL_CONFIG.contact.phoneFormatted, status: 'APPROVED' },
        generalEmail: { ...CLIENT_COMMERCIAL_CONFIG.contact.generalEmail, status: 'APPROVED' },
      },
      shippingPolicy: {
        ...CLIENT_COMMERCIAL_CONFIG.shippingPolicy,
        approvalStatus: 'APPROVED',
      },
    }

    const result = assertProductionCommercialReadiness(approvedConfig, true)
    assert.strictEqual(result.ready, true)
    assert.strictEqual(result.unapprovedFields.length, 0)
  })
})
