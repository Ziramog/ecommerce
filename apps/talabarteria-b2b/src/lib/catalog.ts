import { medusa } from './medusa'
import { DEFAULT_VOLUME_TIERS, VolumeTier } from './utils'

export const FALLBACK_PRODUCT_IMAGES: Record<string, string> = {
  'montura-criolla-de-trabajo':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
  'rollo-lonja-vacuna-pack-x10':
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
  'bozal-cuero-crudo-trenzado':
    'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=1200&q=80',
  'freno-criollo-cabeza-de-moro':
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=1200&q=80',
  'estribos-chaquenos-acero-inoxidable':
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
  'manta-sudadero-lana-pura':
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
  'cuchillo-criollo-vaina-repujada':
    'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=1200&q=80',
  'grasa-de-potro-cuero-500g':
    'https://images.unsplash.com/photo-1608248597359-598d1a117b07?auto=format&fit=crop&w=1200&q=80',
  'cinchon-lona-reforzado-cuero-suela':
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
}

export const LOCAL_STUDIO_IMAGES: Record<string, string> = {
  'rollo-lonja-vacuna-pack-x10': '/images/products/rollo-lonja-vacuna-pack-x10.jpg',
  'montura-criolla-de-trabajo': '/images/products/montura-completa-trabajo.jpg',
  'montura-completa-de-trabajo': '/images/products/montura-completa-trabajo.jpg',
  'cuchillo-criollo-vaina-repujada': '/images/products/cuchillo-criollo-vaina-repujada.jpg',
  'cuchillo-artesanal-alpaca': '/images/products/cuchillo-artesanal-alpaca.jpg',
  'cinturon-carpincho-alpaca': '/images/products/cinturon-carpincho-alpaca.jpg',
  'mate-imperial-alpaca': '/images/products/mate-imperial-alpaca.jpg',
  'estribos-chaquenos-acero-inoxidable': '/images/products/estribos-acero-cuero.jpg',
  'estribos-de-acero-y-cuero': '/images/products/estribos-acero-cuero.jpg',
  'bozal-cuero-crudo-trenzado': '/images/products/cabezada-cuero.jpg',
  'cabezada-de-cuero': '/images/products/cabezada-cuero.jpg',
  'riendas-de-cuero-vacuno': '/images/products/riendas-cuero-vacuno.jpg',
  'cinturon-de-polo': '/images/products/cinturon-polo.jpg',
  'pechera-tejida-artesanal': '/images/products/pechera-tejida-artesanal.jpg',
}

let cachedRegionId: string | null = null

export async function getArgentinaRegionId(): Promise<string> {
  if (cachedRegionId) return cachedRegionId
  try {
    const res = await medusa.store.region.list()
    const argRegion = res.regions.find((r) => r.currency_code === 'ars')
    if (argRegion) {
      cachedRegionId = argRegion.id
      return argRegion.id
    }
  } catch (err) {
    console.error('Error al resolver región ARS B2B:', err)
  }
  return 'reg_01M56B4YZASXPRNGN2PVWPX706'
}

export interface B2BProduct {
  id: string
  title: string
  handle: string
  description?: string | null
  thumbnail?: string | null
  sku: string
  variantId: string
  basePrice: number
  wholesalePrice: number
  volumeTiers: VolumeTier[]
  packUnit: string
  inStock: boolean
}

export async function getB2BProducts(authToken?: string): Promise<B2BProduct[]> {
  try {
    const regionId = await getArgentinaRegionId()
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['authorization'] = `Bearer ${authToken}`
    }

    const res = await medusa.store.product.list(
      {
        region_id: regionId,
        fields: 'id,title,handle,description,thumbnail,*variants,*variants.calculated_price',
      },
      headers
    )

    return (res.products || []).map((p) => {
      const variant = p.variants?.[0]
      const calcPrice = variant?.calculated_price
      const calculatedAmount = calcPrice?.calculated_amount ?? 0
      const originalAmount = calcPrice?.original_amount ?? calculatedAmount
      const fallbackImage = FALLBACK_PRODUCT_IMAGES[p.handle || '']
      const localImage = LOCAL_STUDIO_IMAGES[p.handle || '']

      const wholesalePrice = calculatedAmount > 0 ? calculatedAmount : originalAmount

      return {
        id: p.id,
        title: p.title,
        handle: p.handle || '',
        description: p.description,
        thumbnail: localImage || p.thumbnail || fallbackImage,
        sku: variant?.sku || '',
        variantId: variant?.id || '',
        basePrice: originalAmount,
        wholesalePrice: wholesalePrice,
        volumeTiers: DEFAULT_VOLUME_TIERS,
        packUnit: p.handle?.includes('pack') ? 'Pack cerrado' : 'Unidad',
        inStock: true,
      }
    })
  } catch (error) {
    console.error('Error fetching B2B catalog from Medusa:', error)
    return []
  }
}

export async function getB2BProductByHandle(
  handle: string,
  authToken?: string
): Promise<B2BProduct | null> {
  try {
    const regionId = await getArgentinaRegionId()
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['authorization'] = `Bearer ${authToken}`
    }

    const res = await medusa.store.product.list(
      {
        handle,
        region_id: regionId,
        fields: 'id,title,handle,description,thumbnail,*variants,*variants.calculated_price',
      },
      headers
    )

    const p = res.products?.[0]
    if (!p) return null

    const variant = p.variants?.[0]
    const calcPrice = variant?.calculated_price
    const calculatedAmount = calcPrice?.calculated_amount ?? 0
    const originalAmount = calcPrice?.original_amount ?? calculatedAmount
    const fallbackImage = FALLBACK_PRODUCT_IMAGES[p.handle || '']
    const localImage = LOCAL_STUDIO_IMAGES[p.handle || '']

    return {
      id: p.id,
      title: p.title,
      handle: p.handle || '',
      description: p.description,
      thumbnail: localImage || p.thumbnail || fallbackImage,
      sku: variant?.sku || '',
      variantId: variant?.id || '',
      basePrice: originalAmount,
      wholesalePrice: calculatedAmount > 0 ? calculatedAmount : originalAmount,
      volumeTiers: DEFAULT_VOLUME_TIERS,
      packUnit: p.handle?.includes('pack') ? 'Pack cerrado' : 'Unidad',
      inStock: true,
    }
  } catch (error) {
    console.error(`Error fetching B2B product handle ${handle}:`, error)
    return null
  }
}
