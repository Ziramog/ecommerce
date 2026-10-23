import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { parseArgentinePostalCode, CPA_PROVINCE_LETTER_MAP } from '../utils/postal-code'

describe('WOLFIM Shipping AR — Postal Code Parsing & Validation', () => {
  test('parses traditional 4-digit Argentine postal code', () => {
    const res = parseArgentinePostalCode('1425')
    assert.equal(res.isValid, true)
    assert.equal(res.numericCode, 1425)
    assert.equal(res.normalized, '1425')
  })

  test('parses official 8-character CPA postal code', () => {
    const res = parseArgentinePostalCode('C1425BND')
    assert.equal(res.isValid, true)
    assert.equal(res.numericCode, 1425)
    assert.equal(res.provinceLetter, 'C')
    assert.equal(CPA_PROVINCE_LETTER_MAP[res.provinceLetter!], 'Ciudad Autónoma de Buenos Aires')
  })

  test('parses Cordoba CPA postal code with letter X', () => {
    const res = parseArgentinePostalCode('X5000JPL')
    assert.equal(res.isValid, true)
    assert.equal(res.numericCode, 5000)
    assert.equal(res.provinceLetter, 'X')
    assert.equal(CPA_PROVINCE_LETTER_MAP[res.provinceLetter!], 'Córdoba')
  })

  test('rejects invalid postal codes', () => {
    assert.equal(parseArgentinePostalCode('').isValid, false)
    assert.equal(parseArgentinePostalCode('123').isValid, false) // 3 digits
    assert.equal(parseArgentinePostalCode('12345').isValid, false) // 5 digits
    assert.equal(parseArgentinePostalCode('INVALID_CODE').isValid, false)
  })
})
