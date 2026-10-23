import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { ArgentineShippingCalculator } from '../calculator/shipping-calculator'

describe('WOLFIM Shipping AR — Authoritative Rate Calculator Engine', () => {
  const calculator = new ArgentineShippingCalculator({
    enablePickup: true,
    pickupAddress: 'Av. Alvear 1850, Recoleta, CABA',
    globalFreeShippingThreshold: 200000,
    defaultNationalRate: 14500,
  })

  test('always includes free pickup option when enabled', () => {
    const quotes = calculator.calculateQuotes({
      postalCode: '1425',
      cartSubtotal: 50000,
    })

    const pickup = quotes.find((q) => q.optionId === 'shipping_pickup_local')
    assert.ok(pickup)
    assert.equal(pickup?.amount, 0)
    assert.equal(pickup?.isFree, true)
  })

  test('calculates correct base rate for CABA (zone_caba: $6.500)', () => {
    const quotes = calculator.calculateQuotes({
      postalCode: '1425', // CABA
      cartSubtotal: 80000,
    })

    const delivery = quotes.find((q) => q.optionId.startsWith('shipping_delivery'))
    assert.ok(delivery)
    assert.equal(delivery?.zoneId, 'zone_caba')
    assert.equal(delivery?.amount, 6500)
    assert.equal(delivery?.isFree, false)
  })

  test('calculates correct base rate for Patagonia (zone_patagonia: $17.500)', () => {
    const quotes = calculator.calculateQuotes({
      postalCode: '9410', // Ushuaia, Tierra del Fuego
      cartSubtotal: 90000,
    })

    const delivery = quotes.find((q) => q.optionId.startsWith('shipping_delivery'))
    assert.ok(delivery)
    assert.equal(delivery?.zoneId, 'zone_patagonia')
    assert.equal(delivery?.amount, 17500)
    assert.equal(delivery?.isFree, false)
  })

  test('applies free shipping when cart subtotal meets or exceeds threshold', () => {
    // In CABA, threshold is $150.000
    const quotes = calculator.calculateQuotes({
      postalCode: '1425',
      cartSubtotal: 165000,
    })

    const delivery = quotes.find((q) => q.optionId.startsWith('shipping_delivery'))
    assert.ok(delivery)
    assert.equal(delivery?.amount, 0)
    assert.equal(delivery?.isFree, true)
    assert.match(delivery?.name || '', /¡Gratis!/)
  })

  test('applies weight surcharge for heavy cargo (> 10kg)', () => {
    const quotes = calculator.calculateQuotes({
      postalCode: '1425',
      cartSubtotal: 50000,
      totalWeightKg: 14, // 4kg extra -> 4 * $500 = $2.000 surcharge
    })

    const delivery = quotes.find((q) => q.optionId.startsWith('shipping_delivery'))
    assert.equal(delivery?.amount, 6500 + 2000)
  })

  test('falls back to default national rate for unmatched postal code', () => {
    const quotes = calculator.calculateQuotes({
      postalCode: '9999', // out of standard range
      cartSubtotal: 50000,
    })

    const delivery = quotes.find((q) => q.optionId === 'shipping_delivery_national')
    assert.ok(delivery)
    assert.equal(delivery?.amount, 14500)
  })
})
