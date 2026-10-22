import React from 'react'
import Link from 'next/link'
import { B2BProduct } from '@/lib/catalog'
import { ProductCardB2B } from '@/components/catalog/ProductCardB2B'
import { ArrowRight, Lock } from 'lucide-react'
import { DEFAULT_VOLUME_TIERS } from '@/lib/utils'

interface FeaturedWholesaleProps {
  products: B2BProduct[]
}

const FALLBACK_FEATURED: B2BProduct[] = [
  {
    id: 'feat-1',
    title: 'Montura completa de trabajo',
    handle: 'montura-completa-de-trabajo',
    sku: 'M0010',
    variantId: 'v1',
    basePrice: 420000,
    wholesalePrice: 280000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
    thumbnail: '/images/products/montura-completa-trabajo.jpg',
  },
  {
    id: 'feat-2',
    title: 'Riendas de cuero vacuno',
    handle: 'riendas-de-cuero-vacuno',
    sku: 'R015',
    variantId: 'v2',
    basePrice: 85000,
    wholesalePrice: 58000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Par',
    inStock: true,
    thumbnail: '/images/products/riendas-cuero-vacuno.jpg',
  },
  {
    id: 'feat-3',
    title: 'Cinturón de polo',
    handle: 'cinturon-de-polo',
    sku: 'C079',
    variantId: 'v3',
    basePrice: 62000,
    wholesalePrice: 41000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
    thumbnail: '/images/products/cinturon-polo.jpg',
  },
  {
    id: 'feat-4',
    title: 'Pechera tejida artesanal',
    handle: 'pechera-tejida-artesanal',
    sku: 'T012',
    variantId: 'v4',
    basePrice: 95000,
    wholesalePrice: 64000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
    thumbnail: '/images/products/pechera-tejida-artesanal.jpg',
  },
  {
    id: 'feat-5',
    title: 'Estribos de acero y cuero',
    handle: 'estribos-de-acero-y-cuero',
    sku: 'E040',
    variantId: 'v5',
    basePrice: 110000,
    wholesalePrice: 75000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Par',
    inStock: true,
    thumbnail: '/images/products/estribos-acero-cuero.jpg',
  },
  {
    id: 'feat-6',
    title: 'Cabezada de cuero',
    handle: 'cabezada-de-cuero',
    sku: 'C026',
    variantId: 'v6',
    basePrice: 78000,
    wholesalePrice: 52000,
    volumeTiers: DEFAULT_VOLUME_TIERS,
    packUnit: 'Unidad',
    inStock: true,
    thumbnail: '/images/products/cabezada-cuero.jpg',
  },
]

export function FeaturedWholesaleProducts({ products }: FeaturedWholesaleProps) {
  // Sincronizar con los datos reales de Medusa cuando existan coincidencias por handle o título
  const displayItems = FALLBACK_FEATURED.map((item) => {
    const live = products.find(
      (p) =>
        p.handle === item.handle ||
        p.sku === item.sku ||
        p.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 8))
    )
    if (live) {
      return {
        ...item,
        id: live.id,
        variantId: live.variantId,
        basePrice: live.basePrice > 0 ? live.basePrice : item.basePrice,
        wholesalePrice: live.wholesalePrice > 0 ? live.wholesalePrice : item.wholesalePrice,
        volumeTiers: live.volumeTiers && live.volumeTiers.length > 0 ? live.volumeTiers : item.volumeTiers,
      }
    }
    return item
  })

  return (
    <section className="bg-white py-10 sm:py-14 border-b border-[#E5E5E5] font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Cabecera de la sección */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
            Productos destacados
          </h2>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#172B23] hover:text-[#873427] transition-colors group"
          >
            <span>Ver todos los productos</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Aviso General de Precios Reservados (Sin redundancias en cada card) */}
        <div className="bg-[#FAF8F5] border border-[#E5E5E5] rounded p-3 sm:p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#525252]">
            <Lock className="w-4 h-4 text-[#873427] flex-shrink-0" />
            <span>
              <strong className="text-[#202020]">Canal Mayorista Exclusivo:</strong> Los precios de lista, escalas por volumen y stock en tiempo real están reservados para comercios autorizados.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold flex-shrink-0">
            <Link href="/acceso" className="text-[#873427] hover:underline">
              Iniciar sesión
            </Link>
            <span className="text-[#D4D4D4]">|</span>
            <Link href="/acceso" className="text-[#172B23] hover:underline">
              Solicitar cuenta comercial
            </Link>
          </div>
        </div>

        {/* 6 Productos Destacados Reutilizando ProductCardB2B del Catálogo */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 items-stretch">
          {displayItems.map((product) => (
            <ProductCardB2B
              key={product.id}
              product={product}
              showPriceOnlyAuth={true}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
