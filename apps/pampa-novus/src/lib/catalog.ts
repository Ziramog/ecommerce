import { medusa } from './medusa'

export const FALLBACK_PRODUCT_IMAGES: Record<string, string> = {
  'montura-criolla-de-trabajo':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
  'bozal-cuero-crudo-trenzado':
    'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=1200&q=80',
  'cinturon-carpincho-alpaca':
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80',
  'estribos-chaquenos-acero-inoxidable':
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
  'cinchon-lona-reforzado-cuero-suela':
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
  'freno-criollo-cabeza-de-moro':
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=1200&q=80',
  'manta-sudadero-lana-pura':
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
  'cuchillo-criollo-vaina-repujada':
    'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=1200&q=80',
  'grasa-de-potro-cuero-500g':
    'https://images.unsplash.com/photo-1608248597359-598d1a117b07?auto=format&fit=crop&w=1200&q=80',
}

export const LOCAL_STUDIO_IMAGES: Record<string, string> = {
  'freno-criollo-cabeza-de-moro': '/images/products/freno-criollo-cabeza-de-moro.jpg',
  'rollo-lonja-vacuna-pack-x10': '/images/products/rollo-lonja-vacuna-pack-x10.jpg',
  'cuchillo-artesanal-alpaca': '/images/products/cuchillo-artesanal-alpaca.jpg',
  'cuchillo-criollo-vaina-repujada': '/images/products/cuchillo-criollo-vaina-repujada.jpg',
  'cinturon-carpincho-alpaca': '/images/products/cinturon-carpincho-alpaca.jpg',
  'mate-imperial-alpaca': '/images/products/mate-imperial-alpaca.jpg',
  'montura-criolla-de-trabajo': '/images/products/montura-completa-trabajo.jpg',
  'montura-completa-de-trabajo': '/images/products/montura-completa-trabajo.jpg',
  'estribos-chaquenos-acero-inoxidable': '/images/products/estribos-acero-cuero.jpg',
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
    console.error('Error al resolver región ARS:', err)
  }
  return 'reg_01M56B4YZASXPRNGN2PVWPX706'
}

export interface StorefrontProduct {
  id: string
  title: string
  handle: string
  description?: string | null
  thumbnail?: string | null
  categoryName?: string
  price: number
  originalPrice?: number
  sku: string
  variantId: string
  inStock: boolean
}

export async function getB2CProducts(): Promise<StorefrontProduct[]> {
  try {
    const regionId = await getArgentinaRegionId()
    const res = await medusa.store.product.list({
      region_id: regionId,
      fields: 'id,title,handle,description,thumbnail,*variants,*variants.calculated_price',
    })

    return (res.products || []).map((p) => {
      const variant = p.variants?.[0]
      const calcPrice = variant?.calculated_price
      const price = calcPrice?.calculated_amount ?? 0
      const originalPrice = calcPrice?.original_amount ?? price
      const fallbackImage = FALLBACK_PRODUCT_IMAGES[p.handle || '']
      const localImage = LOCAL_STUDIO_IMAGES[p.handle || '']

      return {
        id: p.id,
        title: p.title,
        handle: p.handle || '',
        description: p.description,
        thumbnail: localImage || p.thumbnail || fallbackImage,
        price,
        originalPrice,
        sku: variant?.sku || '',
        variantId: variant?.id || '',
        inStock: true,
      }
    })
  } catch (error) {
    console.error('Error fetching B2C catalog from Medusa:', error)
    return []
  }
}

export async function getProductByHandle(handle: string): Promise<StorefrontProduct | null> {
  try {
    const regionId = await getArgentinaRegionId()
    const res = await medusa.store.product.list({
      handle,
      region_id: regionId,
      fields: 'id,title,handle,description,thumbnail,*variants,*variants.calculated_price',
    })

    const p = res.products?.[0]
    if (!p) return null

    const variant = p.variants?.[0]
    const calcPrice = variant?.calculated_price
    const price = calcPrice?.calculated_amount ?? 0
    const originalPrice = calcPrice?.original_amount ?? price
    const fallbackImage = FALLBACK_PRODUCT_IMAGES[p.handle || '']
    const localImage = LOCAL_STUDIO_IMAGES[p.handle || '']

    return {
      id: p.id,
      title: p.title,
      handle: p.handle || '',
      description: p.description,
      thumbnail: localImage || p.thumbnail || fallbackImage,
      price,
      originalPrice,
      sku: variant?.sku || '',
      variantId: variant?.id || '',
      inStock: true,
    }
  } catch (error) {
    console.error(`Error fetching product handle ${handle}:`, error)
    return null
  }
}
