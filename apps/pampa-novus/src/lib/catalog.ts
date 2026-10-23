import { medusa } from './medusa'
import { isMockFallbackAllowed, assertLiveCommerceAvailable } from '@mercadal/commerce-core'

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
  'manta-sudadero-lana-pura': '/images/products/manta-sudadero-lana-pura.png',
  'cuchillo-criollo-vaina-repujada':
    'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=1200&q=80',
  'grasa-de-potro-cuero-500g': '/images/products/grasa-de-potro-cuero-500g.png',
  'mate-imperial-alpaca': '/images/products/mate-imperial-alpaca.jpg',
  'cinturon-de-polo': '/images/products/cinturon-polo.jpg',
  'pechera-tejida-artesanal': '/images/products/pechera-tejida-artesanal.jpg',
  'cuchillo-artesanal-alpaca': '/images/products/cuchillo-artesanal-alpaca.jpg',
  'riendas-de-cuero-vacuno': '/images/products/riendas-cuero-vacuno.jpg',
}

export const LOCAL_STUDIO_IMAGES: Record<string, string> = {
  'montura-criolla-de-trabajo': '/images/products/montura-completa-trabajo.jpg',
  'montura-criolla-mercadal': '/images/products/montura-completa-trabajo.jpg',
  'montura-completa-de-trabajo': '/images/products/montura-completa-trabajo.jpg',
  'bozal-cuero-crudo-trenzado': '/images/products/cabezada-cuero.jpg',
  'bozal-de-cuero-premium': '/images/products/cabezada-cuero.jpg',
  'cabezada-de-cuero': '/images/products/cabezada-cuero.jpg',
  'cinturon-carpincho-alpaca': '/images/products/cinturon-carpincho-alpaca.jpg',
  'freno-criollo-cabeza-de-moro': '/images/products/freno-criollo-cabeza-de-moro.jpg',
  'estribos-chaquenos-acero-inoxidable': '/images/products/estribos-acero-cuero.jpg',
  'estribos-de-acero-forrados': '/images/products/estribos-acero-cuero.jpg',
  'manta-sudadero-lana-pura': '/images/products/manta-sudadero-lana-pura.png',
  'manta-pampa-clasica': '/images/products/manta-sudadero-lana-pura.png',
  'cinchon-lona-reforzado-cuero-suela': '/images/products/riendas-cuero-vacuno.jpg',
  'cincha-de-lana-y-cuero': '/images/products/riendas-cuero-vacuno.jpg',
  'riendas-de-cuero-vacuno': '/images/products/riendas-cuero-vacuno.jpg',
  'riendas-de-cuero-trenzado': '/images/products/riendas-cuero-vacuno.jpg',
  'cuchillo-criollo-vaina-repujada': '/images/products/cuchillo-criollo-vaina-repujada.jpg',
  'cuchillo-artesanal-alpaca': '/images/products/cuchillo-artesanal-alpaca.jpg',
  'mate-imperial-alpaca': '/images/products/mate-imperial-alpaca.jpg',
  'rollo-lonja-vacuna-pack-x10': '/images/products/rollo-lonja-vacuna-pack-x10.jpg',
  'cinturon-de-polo': '/images/products/cinturon-polo.jpg',
  'pechera-tejida-artesanal': '/images/products/pechera-tejida-artesanal.jpg',
  'grasa-de-potro-cuero-500g': '/images/products/grasa-de-potro-cuero-500g.png',
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

/**
 * Catálogo Maestro Priorizado (14 SKUs B2C para Pampa Novus).
 * Nota: El SKU 15 (SKU-B2B-004: Rollo de Lonja Vacuna) es exclusivo del canal mayorista Talabartería Mercadal.
 */
export const STATIC_B2C_FALLBACK_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'prod_01M56B4Z33F0MGB1JFK9VDE9KJ',
    title: 'Montura Criolla de Trabajo en Suela',
    handle: 'montura-criolla-de-trabajo',
    description:
      'Montura criolla artesanal confeccionada en cuero vacuno curtido al tanino con bastos rellenos de cerda natural.',
    thumbnail: '/images/products/montura-completa-trabajo.jpg',
    categoryName: 'Monturas Criollas',
    price: 450000,
    originalPrice: 450000,
    sku: 'SKU-CRI-001',
    variantId: 'variant_01M56B4ZCJSQGYBCYZBSK4ZD0V',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z33RPG0ZFRX8MQWR7SR',
    title: 'Bozal de Cuero Crudo Trenzado 8 Cabos',
    handle: 'bozal-cuero-crudo-trenzado',
    description:
      'Bozal criollo tradicional tejido a mano en tiento de cuero crudo seleccionado con testera y ahogador reforzados.',
    thumbnail: '/images/products/cabezada-cuero.jpg',
    categoryName: 'Bozales & Riendas',
    price: 85000,
    originalPrice: 85000,
    sku: 'SKU-DUAL-002',
    variantId: 'variant_01M56B4ZCJD6M4Q9QT1A24YGNH',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z33Z43C7J2GE2B0Y1HW',
    title: 'Cinturón de Carpincho con Pasador de Alpaca',
    handle: 'cinturon-carpincho-alpaca',
    description:
      'Cinturón de cuero de carpincho legítimo con forrería de badana y pasador artesanal cincelado en alpaca.',
    thumbnail: '/images/products/cinturon-carpincho-alpaca.jpg',
    categoryName: 'Cinturones & Marroquinería',
    price: 120000,
    originalPrice: 120000,
    sku: 'SKU-B2C-003',
    variantId: 'variant_01M56B4ZCKEPWC5CPNBA9Q161Q',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z340QVNE05R9FH9QZNY',
    title: 'Freno Criollo Cabeza de Moro Forjado',
    handle: 'freno-criollo-cabeza-de-moro',
    description:
      'Freno tradicional pata curva forjado en hierro dulce con coscojas sonoras y barbada de cadena calibrada.',
    thumbnail: '/images/products/freno-criollo-cabeza-de-moro.jpg',
    categoryName: 'Estribos & Aperos',
    price: 95000,
    originalPrice: 95000,
    sku: 'SKU-DUAL-007',
    variantId: 'variant_01M56B4ZCM8P52346G8B5TXDGC',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z341M84FD6KRHMTBVFF',
    title: 'Estribos Chaqueños de Acero Inoxidable',
    handle: 'estribos-chaquenos-acero-inoxidable',
    description:
      'Par de estribos campana forjados en acero inoxidable 304 pulido espejo, pisada antideslizante estriada.',
    thumbnail: '/images/products/estribos-acero-cuero.jpg',
    categoryName: 'Estribos & Aperos',
    price: 65000,
    originalPrice: 65000,
    sku: 'SKU-DUAL-005',
    variantId: 'variant_01M56B4ZCKWYCTNGQ1G53A09X0',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z3458F1KJ60DSZ8AP1E',
    title: 'Manta Sudadero de Lana Pura de Oveja',
    handle: 'manta-sudadero-lana-pura',
    description:
      'Manta telar de lana virgen de oveja hilada a mano, alta capacidad de absorción y protección del lomo equino.',
    thumbnail: '/images/products/manta-sudadero-lana-pura.png',
    categoryName: 'Aperos de Campo',
    price: 52000,
    originalPrice: 52000,
    sku: 'SKU-DUAL-008',
    variantId: 'variant_01M56B4ZCN4SF6Y5RA640CHR9F',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z34BSWKQQ69524HGQBY',
    title: 'Cuchillo Criollo con Vaina Repujada Artesanal',
    handle: 'cuchillo-criollo-vaina-repujada',
    description:
      'Cuchillo de campo hoja de 16cm en acero al carbono 1070 con cabo de guampa de ciervo y vaina repujada a mano.',
    thumbnail: '/images/products/cuchillo-criollo-vaina-repujada.jpg',
    categoryName: 'Platería & Cuchillería',
    price: 110000,
    originalPrice: 110000,
    sku: 'SKU-DUAL-009',
    variantId: 'variant_01M56B4ZCN5ZFRQ0TRMG2PT6EG',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z34PR02GKQW7GE4Q4DD',
    title: 'Grasa de Potro Filtrada para Cuidado de Cuero (500g)',
    handle: 'grasa-de-potro-cuero-500g',
    description:
      'Compuesto acondicionador e impermeabilizante a base de grasa de potro purificada, cera de abejas y aceites naturales.',
    thumbnail: '/images/products/grasa-de-potro-cuero-500g.png',
    categoryName: 'Cuidado del Cuero',
    price: 12000,
    originalPrice: 12000,
    sku: 'SKU-DUAL-010',
    variantId: 'variant_01M56B4ZCPBVRJ4SR8RCVBPT05',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z34X7W28NAK9VKJNP76',
    title: 'Cinchón de Lona Reforzado y Traba Cuero Suela',
    handle: 'cinchon-lona-reforzado-cuero-suela',
    description:
      'Cinchón ancho de lona pesada de 12cm con pasadores y lengüeta en cuero suela de 4mm, hebilla doble rodillo.',
    thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    categoryName: 'Aperos de Campo',
    price: 38000,
    originalPrice: 38000,
    sku: 'SKU-DUAL-006',
    variantId: 'variant_01M56B4ZCMZHHQZBBBKFGNJ9XA',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z35K88G7W8M2X8J91L0',
    title: 'Mate Imperial de Calabaza con Virola de Alpaca Cincelada',
    handle: 'mate-imperial-alpaca',
    description:
      'Mate criollo imperial de calabaza brasileña seleccionada, forrado en cuero vacuno teñido a mano con virola y base cinceladas en alpaca maciza.',
    thumbnail: '/images/products/mate-imperial-alpaca.jpg',
    categoryName: 'Regalos de Autor',
    price: 98000,
    originalPrice: 98000,
    sku: 'SKU-B2C-011',
    variantId: 'variant_01M56B4ZCPS7VBRW991MA005TR',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z35M44J2C3K8P1T79Y1',
    title: 'Cinturón de Polo Guarda Pampa Bordado a Mano',
    handle: 'cinturon-de-polo',
    description:
      'Cinturón tradicional de polo confeccionado sobre cuero curtido al quebracho con guarda pampa bordada en hilo encerado y hebilla de latón macizo.',
    thumbnail: '/images/products/cinturon-polo.jpg',
    categoryName: 'Cinturones & Marroquinería',
    price: 78000,
    originalPrice: 78000,
    sku: 'SKU-DUAL-012',
    variantId: 'variant_01M56B4ZCQ56XTYV1120BBK881',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z35P11D9H4L2N8R63X4',
    title: 'Pechera Criolla en Tiento Crudo Tejida a Mano',
    handle: 'pechera-tejida-artesanal',
    description:
      'Pechera reglamentaria para apero criollo tejida íntegramente en tientos de cuero crudo de potro con argollas forjadas y pasadores trenzados.',
    thumbnail: '/images/products/pechera-tejida-artesanal.jpg',
    categoryName: 'Aperos de Campo',
    price: 135000,
    originalPrice: 135000,
    sku: 'SKU-DUAL-013',
    variantId: 'variant_01M56B4ZCR49YUVB2230CCL992',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z35R88F3P5M7K2W15Z7',
    title: 'Cuchillo Verijero Artesanal en Alpaca y Madera de Guayacán',
    handle: 'cuchillo-artesanal-alpaca',
    description:
      'Cuchillo criollo verijero hoja de 14cm en acero inoxidable 440 con botón forjado, cabo facetado en guayacán y vaina de cuero con puntera cincelada.',
    thumbnail: '/images/products/cuchillo-artesanal-alpaca.jpg',
    categoryName: 'Platería & Cuchillería',
    price: 145000,
    originalPrice: 145000,
    sku: 'SKU-B2C-014',
    variantId: 'variant_01M56B4ZCS32ZWXC3340DDM003',
    inStock: true,
  },
  {
    id: 'prod_01M56B4Z35T99G5Q6N1L8K48V9',
    title: 'Riendas Criollas de Cuero Vacuno con Azotera',
    handle: 'riendas-de-cuero-vacuno',
    description:
      'Par de riendas criollas de 2.20m confeccionadas en cuero vacuno engrasado de 20mm con costura a mano en hilo de lino y azotera de cuero crudo.',
    thumbnail: '/images/products/riendas-cuero-vacuno.jpg',
    categoryName: 'Bozales & Riendas',
    price: 72000,
    originalPrice: 72000,
    sku: 'SKU-DUAL-015',
    variantId: 'variant_01M56B4ZCT11AXWD4450EEN114',
    inStock: true,
  },
]

export async function getB2CProducts(): Promise<StorefrontProduct[]> {
  try {
    const regionId = await getArgentinaRegionId()
    const res = await medusa.store.product.list({
      region_id: regionId,
      fields: 'id,title,handle,description,thumbnail,*variants,*variants.calculated_price',
    })

    if (!res.products || res.products.length === 0) {
      if (isMockFallbackAllowed()) {
        return STATIC_B2C_FALLBACK_PRODUCTS
      }
      return []
    }

    return res.products.map((p) => {
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
    if (isMockFallbackAllowed()) {
      console.warn(
        '[B2C Catalog] No se pudo conectar con el backend Medusa. Mocks permitidos por entorno local.',
        error instanceof Error ? error.message : error
      )
      return STATIC_B2C_FALLBACK_PRODUCTS
    }
    // Fail-closed policy for production
    assertLiveCommerceAvailable(error)
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
    if (!p) {
      if (isMockFallbackAllowed()) {
        return STATIC_B2C_FALLBACK_PRODUCTS.find((prod) => prod.handle === handle) || null
      }
      return null
    }

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
    if (isMockFallbackAllowed()) {
      console.warn(
        `[B2C Catalog] Error al consultar ${handle}. Usando fallback local permitido.`,
        error instanceof Error ? error.message : error
      )
      return STATIC_B2C_FALLBACK_PRODUCTS.find((p) => p.handle === handle) || null
    }
    assertLiveCommerceAvailable(error)
    return null
  }
}
