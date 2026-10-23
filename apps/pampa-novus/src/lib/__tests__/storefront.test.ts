import test, { describe, before } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatCurrencyARS,
  formatInstallments,
  cn,
} from '../utils'
import {
  FALLBACK_PRODUCT_IMAGES,
  getB2CProducts,
  getProductByHandle,
  STATIC_B2C_FALLBACK_PRODUCTS,
} from '../catalog'

describe('Pampa Novus — Utility Helpers', () => {
  test('cn() correctly merges class names and tailwind utilities', () => {
    const result = cn('text-sm', false && 'hidden', 'text-base', undefined, 'p-4')
    assert.strictEqual(result, 'text-base p-4')
  })

  test('formatCurrencyARS() formats numbers into Argentine Pesos representation', () => {
    const formatted = formatCurrencyARS(450000)
    assert.ok(
      formatted.includes('450') && (formatted.includes('$') || formatted.includes('ARS')),
      `Unexpected ARS format: ${formatted}`
    )
  })

  test('formatInstallments() correctly divides and labels cuotas', () => {
    const formatted = formatInstallments(450000, 3)
    assert.ok(
      formatted.includes('3 cuotas') && (formatted.includes('cuotas fijas') || formatted.includes('150')),
      `Unexpected installment format: ${formatted}`
    )
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
        FALLBACK_PRODUCT_IMAGES[handle].startsWith('https://images.unsplash.com') ||
          FALLBACK_PRODUCT_IMAGES[handle].startsWith('/images/'),
        `Fallback image must be a valid path/URL for ${handle}`
      )
    }
  })
})

describe('Pampa Novus — Backend Integration & Fail-Closed Guard (Staging)', () => {
  let isStagingLive = false

  before(async () => {
    try {
      const res = await fetch('http://100.124.132.48:9000/health', {
        signal: AbortSignal.timeout(1500),
      })
      isStagingLive = res.ok
    } catch {
      isStagingLive = false
    }
  })

  test('getB2CProducts() retrieves products or enforces fail-closed guard', async () => {
    if (isStagingLive) {
      const products = await getB2CProducts()
      assert.ok(Array.isArray(products), 'Expected products to be an array')
      assert.strictEqual(products.length, 9)
    } else {
      // When Staging is offline (policy restart=no), fail-closed guard is verified
      const prev = process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK
      try {
        process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = 'true'
        const fallbackProducts = await getB2CProducts()
        assert.ok(fallbackProducts.length > 0)
        assert.strictEqual(fallbackProducts[0].sku, 'SKU-CRI-001')

        delete process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK
        await assert.rejects(
          async () => {
            await getB2CProducts()
          },
          (err: any) => {
            assert.strictEqual(err.code, 'SERVICE_UNAVAILABLE')
            return true
          }
        )
      } finally {
        process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = prev
      }
    }
  })

  test('getProductByHandle() retrieves product or enforces fail-closed guard', async () => {
    if (isStagingLive) {
      const product = await getProductByHandle('montura-criolla-de-trabajo')
      assert.ok(product)
      assert.strictEqual(product.sku, 'SKU-CRI-001')
    } else {
      const prev = process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK
      try {
        process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = 'true'
        const product = await getProductByHandle('montura-criolla-de-trabajo')
        assert.ok(product)
        assert.strictEqual(product.sku, 'SKU-CRI-001')

        delete process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK
        await assert.rejects(
          async () => {
            await getProductByHandle('montura-criolla-de-trabajo')
          },
          (err: any) => {
            assert.strictEqual(err.code, 'SERVICE_UNAVAILABLE')
            return true
          }
        )
      } finally {
        process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK = prev
      }
    }
  })
})
