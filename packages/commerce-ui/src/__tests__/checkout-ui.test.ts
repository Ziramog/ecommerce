import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { ARGENTINA_PROVINCES } from '../components/CheckoutAddressStep'

describe('WOLFIM Commerce UI — Generic Accessible Components', () => {
  test('ARGENTINA_PROVINCES contains 24 jurisdictions including CABA', () => {
    assert.equal(ARGENTINA_PROVINCES.length, 24)
    assert.ok(ARGENTINA_PROVINCES.includes('Ciudad Autónoma de Buenos Aires'))
    assert.ok(ARGENTINA_PROVINCES.includes('Buenos Aires'))
    assert.ok(ARGENTINA_PROVINCES.includes('Córdoba'))
    assert.ok(ARGENTINA_PROVINCES.includes('Santa Fe'))
    assert.ok(ARGENTINA_PROVINCES.includes('Mendoza'))
  })
})
