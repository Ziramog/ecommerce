import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatCurrencyARS,
  formatCUIT,
  validateCUIT,
  calculateVolumeDiscount,
  cn,
} from '../utils'
import {
  FALLBACK_PRODUCT_IMAGES,
  getB2BProducts,
  getB2BProductByHandle,
} from '../catalog'

describe('Talabartería Mercadal B2B — Fiscal & Utility Helpers', () => {
  test('cn() correctly merges class names and tailwind utilities', () => {
    const result = cn('px-4 py-2', 'bg-navy', false && 'hidden', 'text-white')
    assert.strictEqual(result, 'px-4 py-2 bg-navy text-white')
  })

  test('formatCurrencyARS() formats numbers into Argentine Pesos representation', () => {
    const formatted = formatCurrencyARS(320000)
    assert.ok(
      formatted.includes('320') || formatted.includes('320.000'),
      `Expected 320000 formatted, got: ${formatted}`
    )
  })

  test('formatCUIT() formats raw 11 digits into XX-XXXXXXXX-X', () => {
    const formatted = formatCUIT('30712345679')
    assert.strictEqual(formatted, '30-71234567-9')
  })

  test('validateCUIT() validates correct Argentine CUITs and rejects invalid ones', () => {
    // Valid CUITs
    assert.strictEqual(validateCUIT('30-58291472-5'), true, 'Should validate correct CUIT')
    assert.strictEqual(validateCUIT('33-69345023-9'), true, 'Should validate correct AFIP CUIT')
    assert.strictEqual(validateCUIT('20-22222222-3'), true, 'Should validate correct CUIT')

    // Invalid CUITs (wrong check digit or bad length)
    assert.strictEqual(validateCUIT('30-58291472-4'), false, 'Should reject wrong check digit')
    assert.strictEqual(validateCUIT('12345'), false, 'Should reject short string')
  })

  test('calculateVolumeDiscount() applies volume tiers correctly', () => {
    const basePrice = 100000

    // 1-4 units: 0% discount
    const tier1 = calculateVolumeDiscount(basePrice, 2)
    assert.strictEqual(tier1.unitPrice, 100000)
    assert.strictEqual(tier1.discountPercent, 0)
    assert.strictEqual(tier1.totalPrice, 200000)

    // 5-9 units: -10% discount
    const tier2 = calculateVolumeDiscount(basePrice, 5)
    assert.strictEqual(tier2.unitPrice, 90000)
    assert.strictEqual(tier2.discountPercent, 10)
    assert.strictEqual(tier2.totalPrice, 450000)

    // 10+ units: -20% discount
    const tier3 = calculateVolumeDiscount(basePrice, 10)
    assert.strictEqual(tier3.unitPrice, 80000)
    assert.strictEqual(tier3.discountPercent, 20)
    assert.strictEqual(tier3.totalPrice, 800000)
  })
})

describe('Talabartería Mercadal B2B — Image & Photographic Assets', () => {
  test('FALLBACK_PRODUCT_IMAGES includes photographic asset for wholesale lonja pack', () => {
    assert.ok(
      FALLBACK_PRODUCT_IMAGES['rollo-lonja-vacuna-pack-x10'],
      'Missing fallback image for rollo-lonja-vacuna-pack-x10'
    )
    assert.ok(
      FALLBACK_PRODUCT_IMAGES['rollo-lonja-vacuna-pack-x10'].startsWith(
        'https://images.unsplash.com'
      )
    )
  })
})

describe('Talabartería Mercadal B2B — Live Medusa Backend Integration (Staging)', () => {
  test('getB2BProducts() retrieves exactly 9 wholesale products from sc_talabarteria_b2b', async () => {
    const products = await getB2BProducts()
    assert.ok(Array.isArray(products), 'Expected products to be an array')
    assert.strictEqual(
      products.length,
      9,
      `Expected exactly 9 products in B2B channel, got ${products.length}`
    )

    for (const p of products) {
      assert.ok(p.id, 'Product must have an id')
      assert.ok(p.title, 'Product must have a title')
      assert.ok(p.handle, 'Product must have a handle')
      assert.ok(p.sku, `Product ${p.title} must have a SKU`)
      assert.ok(p.variantId, `Product ${p.title} must have a variantId`)
      assert.ok(typeof p.wholesalePrice === 'number', `Product ${p.title} must have wholesale price`)
    }
  })

  test('B2B wholesale-exclusive product (rollo-lonja-vacuna-pack-x10) is present in B2B catalog', async () => {
    const products = await getB2BProducts()
    const skus = products.map((p) => p.sku)
    assert.ok(
      skus.includes('SKU-B2B-004'),
      'Wholesale pack SKU-B2B-004 must be present in B2B channel'
    )
  })

  test('B2C retail-exclusive product (cinturon-carpincho-alpaca) is NOT present in B2B catalog', async () => {
    const products = await getB2BProducts()
    const skus = products.map((p) => p.sku)
    assert.ok(
      !skus.includes('SKU-B2C-003'),
      'Retail exclusive SKU-B2C-003 must NOT leak into B2B sales channel'
    )
  })

  test('getB2BProductByHandle() retrieves detailed info for rollo-lonja-vacuna-pack-x10', async () => {
    const product = await getB2BProductByHandle('rollo-lonja-vacuna-pack-x10')
    assert.ok(product, 'Product rollo-lonja-vacuna-pack-x10 must exist in B2B catalog')
    assert.strictEqual(product.sku, 'SKU-B2B-004')
    assert.strictEqual(product.packUnit, 'Pack cerrado')
    assert.ok(product.wholesalePrice > 0, `Wholesale price should be > 0 ARS, got ${product.wholesalePrice}`)
  })
})
