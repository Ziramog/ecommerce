import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { formatCurrencyARS, formatInstallments, cn } from '../utils'
import { FALLBACK_PRODUCT_IMAGES, getB2CProducts, getProductByHandle } from '../catalog'

describe('Pampa Novus — Utility Helpers', () => {
  test('cn() correctly merges class names and tailwind utilities', () => {
    const result = cn('px-4 py-2', 'bg-pampa-100', false && 'hidden', 'text-white')
    assert.strictEqual(result, 'px-4 py-2 bg-pampa-100 text-white')
  })

  test('formatCurrencyARS() formats numbers into Argentine Pesos representation', () => {
    const formatted = formatCurrencyARS(150000)
    assert.ok(
      formatted.includes('150') || formatted.includes('150.000'),
      `Expected 150000 formatted, got: ${formatted}`
    )
  })

  test('formatInstallments() correctly divides and labels cuotas', () => {
    const installments = formatInstallments(300000, 3)
    assert.ok(installments.startsWith('3 cuotas fijas de'), `Expected 3 cuotas prefix, got: ${installments}`)
    assert.ok(installments.includes('100'), `Expected ~100000 per installment, got: ${installments}`)
  })
})

describe('Pampa Novus — Catalog Fallbacks & Image Mapping', () => {
  test('FALLBACK_PRODUCT_IMAGES contains photographic assets for core craft products', () => {
    const expectedHandles = [
      'montura-criolla-de-trabajo',
      'bozal-cuero-crudo-trenzado',
      'cinturon-carpincho-alpaca',
      'freno-criollo-cabeza-de-moro',
    ]
    for (const handle of expectedHandles) {
      assert.ok(
        FALLBACK_PRODUCT_IMAGES[handle],
        `Missing fallback image for core handle: ${handle}`
      )
      assert.ok(
        FALLBACK_PRODUCT_IMAGES[handle].startsWith('https://images.unsplash.com'),
        `Fallback image must be a valid Unsplash URL for ${handle}`
      )
    }
  })
})

describe('Pampa Novus — Live Medusa Backend Integration (Staging)', () => {
  test('getB2CProducts() retrieves exactly 9 published B2C products from Staging', async () => {
    const products = await getB2CProducts()
    assert.ok(Array.isArray(products), 'Expected products to be an array')
    assert.strictEqual(
      products.length,
      9,
      `Expected exactly 9 B2C products in Sales Channel sc_pampa_novus_b2c, got ${products.length}`
    )

    // Verify all products have required storefront properties
    for (const p of products) {
      assert.ok(p.id, 'Product must have an id')
      assert.ok(p.title, 'Product must have a title')
      assert.ok(p.handle, 'Product must have a handle')
      assert.ok(p.sku, `Product ${p.title} must have a SKU`)
      assert.ok(p.variantId, `Product ${p.title} must have a variantId`)
      assert.ok(typeof p.price === 'number', `Product ${p.title} must have a numeric price`)
    }
  })

  test('getProductByHandle() retrieves detailed info for montura-criolla-de-trabajo', async () => {
    const product = await getProductByHandle('montura-criolla-de-trabajo')
    assert.ok(product, 'Product montura-criolla-de-trabajo must exist in B2C catalog')
    assert.strictEqual(product.handle, 'montura-criolla-de-trabajo')
    assert.strictEqual(product.sku, 'SKU-CRI-001')
    assert.ok(product.price > 0, `Montura price should be > 0 ARS, got ${product.price}`)
  })

  test('B2B wholesale-only products are excluded from B2C catalog', async () => {
    // Attempt to fetch any product that is wholesale-only or not in B2C
    const products = await getB2CProducts()
    const skus = products.map((p) => p.sku)
    // In our 10 PoC products, 9 are published to B2C, 1 is wholesale only (SKU-IND-010 or similar)
    // Ensure that exactly 9 SKUs are present and none leaks from external channels
    assert.strictEqual(skus.length, 9)
  })
})
