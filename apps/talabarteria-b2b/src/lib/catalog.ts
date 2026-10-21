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
  'manta-sudadero-lana-pura': '/images/products/manta-sudadero-lana-pura.png',
  'cuchillo-criollo-vaina-repujada':
    'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=1200&q=80',
  'grasa-de-potro-cuero-500g': '/images/products/grasa-de-potro-cuero-500g.png',
  'cinchon-lona-reforzado-cuero-suela':
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
}

export const LOCAL_STUDIO_IMAGES: Record<string, string> = {
  'freno-criollo-cabeza-de-moro': '/images/products/freno-criollo-cabeza-de-moro.jpg',
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
  'grasa-de-potro-cuero-500g': '/images/products/grasa-de-potro-cuero-500g.png',
  'manta-sudadero-lana-pura': '/images/products/manta-sudadero-lana-pura.png',
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

export const STATIC_B2B_FALLBACK_PRODUCTS: B2BProduct[] = [
  {
    id: 'prod_01M56B4Z33F0MGB1JFK9VDE9KJ',
    title: 'Montura Criolla de Trabajo en Suela',
    handle: 'montura-criolla-de-trabajo',
    description:
      'Montura criolla artesanal confeccionada en cuero vacuno curtido al tanino con bastos rellenos de cerda natural.',
    thumbnail: '/images/products/montura-completa-trabajo.jpg',
    sku: 'SKU-CRI-001',
    variantId: 'variant_01M56B4ZCJSQGYBCYZBSK4ZD0V',
    basePrice: 450000,
    wholesalePrice: 450000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z33H42WK1DHNMBFRPNZ',
    title: 'Rollo de Lonja Vacuna Curtida para Sogueo (Pack x10)',
    handle: 'rollo-lonja-vacuna-pack-x10',
    description:
      'Pack mayorista de 10 rollos de lonja seleccionada de 25mm para trabajos de sogueo y guarnicioneria profesional.',
    thumbnail: '/images/products/rollo-lonja-vacuna-pack-x10.jpg',
    sku: 'SKU-B2B-004',
    variantId: 'variant_01M56B4ZCKVJD6TZTCMQQH3P54',
    basePrice: 190000,
    wholesalePrice: 190000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Pack cerrado',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z33RPG0ZFRX8MQWR7SR',
    title: 'Bozal de Cuero Crudo Trenzado 8 Cabos',
    handle: 'bozal-cuero-crudo-trenzado',
    description:
      'Bozal criollo tradicional tejido a mano en tiento de cuero crudo seleccionado con testera y ahogador reforzados.',
    thumbnail: '/images/products/cabezada-cuero.jpg',
    sku: 'SKU-DUAL-002',
    variantId: 'variant_01M56B4ZCJD6M4Q9QT1A24YGNH',
    basePrice: 85000,
    wholesalePrice: 85000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z340QVNE05R9FH9QZNY',
    title: 'Freno Criollo Cabeza de Moro Forjado',
    handle: 'freno-criollo-cabeza-de-moro',
    description:
      'Freno tradicional pata curva forjado en hierro dulce con coscojas sonoras y barbada de cadena calibrada.',
    thumbnail: '/images/products/freno-criollo-cabeza-de-moro.jpg',
    sku: 'SKU-DUAL-007',
    variantId: 'variant_01M56B4ZCM8P52346G8B5TXDGC',
    basePrice: 95000,
    wholesalePrice: 95000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z341M84FD6KRHMTBVFF',
    title: 'Estribos Chaquenos de Acero Inoxidable',
    handle: 'estribos-chaquenos-acero-inoxidable',
    description:
      'Par de estribos campana forjados en acero inoxidable 304 pulido espejo, pisada antideslizante estriada.',
    thumbnail: '/images/products/estribos-acero-cuero.jpg',
    sku: 'SKU-DUAL-005',
    variantId: 'variant_01M56B4ZCKWYCTNGQ1G53A09X0',
    basePrice: 65000,
    wholesalePrice: 65000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z3458F1KJ60DSZ8AP1E',
    title: 'Manta Sudadero de Lana Pura de Oveja',
    handle: 'manta-sudadero-lana-pura',
    description:
      'Manta telar de lana virgen de oveja hilada a mano, alta capacidad de absorcion y proteccion del lomo equino.',
    thumbnail: '/images/products/manta-sudadero-lana-pura.png',
    sku: 'SKU-DUAL-008',
    variantId: 'variant_01M56B4ZCN4SF6Y5RA640CHR9F',
    basePrice: 52000,
    wholesalePrice: 52000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z34BSWKQQ69524HGQBY',
    title: 'Cuchillo Criollo con Vaina Repujada Artesanal',
    handle: 'cuchillo-criollo-vaina-repujada',
    description:
      'Cuchillo de campo hoja de 16cm en acero al carbono 1070 con cabo de guampa de ciervo y vaina repujada a mano.',
    thumbnail: '/images/products/cuchillo-criollo-vaina-repujada.jpg',
    sku: 'SKU-DUAL-009',
    variantId: 'variant_01M56B4ZCN5ZFRQ0TRMG2PT6EG',
    basePrice: 110000,
    wholesalePrice: 110000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z34PR02GKQW7GE4Q4DD',
    title: 'Grasa de Potro Filtrada para Cuidado de Cuero (500g)',
    handle: 'grasa-de-potro-cuero-500g',
    description:
      'Compuesto acondicionador e impermeabilizante a base de grasa de potro purificada, cera de abejas y aceites naturales.',
    thumbnail: '/images/products/grasa-de-potro-cuero-500g.png',
    sku: 'SKU-DUAL-010',
    variantId: 'variant_01M56B4ZCPBVRJ4SR8RCVBPT05',
    basePrice: 12000,
    wholesalePrice: 12000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z34X7W28NAK9VKJNP76',
    title: 'Cinchon de Lona Reforzado y Traba Cuero Suela',
    handle: 'cinchon-lona-reforzado-cuero-suela',
    description:
      'Cinchon ancho de lona pesada de 12cm con pasadores y lengueta en cuero suela de 4mm, hebilla doble rodillo.',
    thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    sku: 'SKU-DUAL-006',
    variantId: 'variant_01M56B4ZCMZHHQZBBBKFGNJ9XA',
    basePrice: 38000,
    wholesalePrice: 38000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
  },
]

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

    if (!res.products || res.products.length === 0) {
      return STATIC_B2B_FALLBACK_PRODUCTS
    }

    return res.products.map((p) => {
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
    console.warn(
      '[B2B Catalog] No se pudo conectar con el backend Medusa en vivo. Usando catálogo estático de resiliencia.',
      error instanceof Error ? error.message : error
    )
    return STATIC_B2B_FALLBACK_PRODUCTS
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
    if (!p) {
      return STATIC_B2B_FALLBACK_PRODUCTS.find((prod) => prod.handle === handle) || null
    }

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
    console.warn(
      `[B2B Catalog] No se pudo obtener producto ${handle} desde Medusa. Usando fallback estático.`,
      error instanceof Error ? error.message : error
    )
    return STATIC_B2B_FALLBACK_PRODUCTS.find((p) => p.handle === handle) || null
  }
}
