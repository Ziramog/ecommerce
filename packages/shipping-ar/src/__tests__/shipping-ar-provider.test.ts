import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { ArgentineShippingProviderService } from '../services/shipping-ar-provider'

describe('WOLFIM Shipping AR — Fulfillment Provider Service (Medusa 2.21.2)', () => {
  const provider = new ArgentineShippingProviderService(
    {},
    {
      enablePickup: true,
      pickupAddress: 'Av. Alvear 1850, Recoleta, CABA',
      pickupTitle: 'Retiro en Taller Mercadal (Sin Cargo)',
      defaultNationalRate: 14500,
    }
  )

  test('getFulfillmentOptions() returns pickup and delivery options', async () => {
    const options = await provider.getFulfillmentOptions()
    assert.equal(options.length, 2)
    assert.equal(options[0].id, 'shipping-ar-pickup')
    assert.equal(options[1].id, 'shipping-ar-delivery')
  })

  test('validateFulfillmentData() accepts valid postal code', async () => {
    const res = await provider.validateFulfillmentData(
      { id: 'shipping-ar-delivery' },
      { postal_code: '1425' },
      {}
    )
    assert.equal(res.postal_code, '1425')
    assert.equal(res.is_pickup, false)
  })

  test('validateFulfillmentData() rejects invalid postal code', async () => {
    await assert.rejects(async () => {
      await provider.validateFulfillmentData(
        { id: 'shipping-ar-delivery' },
        { postal_code: 'BAD_CP' },
        {}
      )
    }, /Código postal argentino inválido/)
  })

  test('calculatePrice() returns 0 for pickup option', async () => {
    const res = await provider.calculatePrice(
      { id: 'shipping-ar-pickup' },
      { is_pickup: true },
      { cart: { subtotal: 50000 } }
    )
    assert.equal(res.calculated_amount, 0)
    assert.equal(res.is_calculated_price_tax_inclusive, true)
  })

  test('calculatePrice() authoritatively computes CABA rate ($6.500)', async () => {
    const res = await provider.calculatePrice(
      { id: 'shipping-ar-delivery' },
      { postal_code: '1425' },
      { cart: { subtotal: 75000 } }
    )
    assert.equal(res.calculated_amount, 6500)
    assert.equal(res.is_calculated_price_tax_inclusive, true)
  })

  test('calculatePrice() authoritatively returns 0 for orders above free threshold', async () => {
    const res = await provider.calculatePrice(
      { id: 'shipping-ar-delivery' },
      { postal_code: '1425' },
      { cart: { subtotal: 180000 } } // above $150.000
    )
    assert.equal(res.calculated_amount, 0)
    assert.equal(res.is_calculated_price_tax_inclusive, true)
  })

  test('createFulfillment() returns tracking number and carrier metadata', async () => {
    const res = await provider.createFulfillment(
      { is_pickup: false },
      [],
      {},
      { shipping_option: { data: { id: 'shipping-ar-delivery' } } }
    )
    assert.ok(res.data.tracking_number.startsWith('AR-ENV-'))
    assert.equal(res.data.carrier, 'Logística Nacional AR')
  })
})
