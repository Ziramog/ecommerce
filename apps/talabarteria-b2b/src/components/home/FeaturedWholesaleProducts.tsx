'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { B2BProduct } from '@/lib/catalog'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { useB2BCart } from '@/context/B2BCartContext'
import { formatCurrencyARS, calculateVolumeDiscount } from '@/lib/utils'
import { Lock, ShoppingBag, Check, ArrowRight } from 'lucide-react'

interface FeaturedCardProps {
  product: B2BProduct
  codeOverride?: string
}

export function FeaturedWholesaleCard({ product, codeOverride }: FeaturedCardProps) {
  const { isAuthenticated } = useAuthB2B()
  const { addItem } = useB2BCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const codeDisplay =
    codeOverride ||
    (product.sku ? `Cód. ${product.sku.replace('SKU-', '')}` : `Cód. ${product.handle.slice(0, 5).toUpperCase()}`)

  const { unitPrice, discountPercent } = calculateVolumeDiscount(
    product.wholesalePrice,
    qty,
    product.volumeTiers
  )

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white border border-[#E8E2D8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Thumbnail */}
        <Link href={`/catalogo`} className="block relative h-44 sm:h-48 bg-[#F4EFE8] overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#A8A29E]">
              Sin imagen
            </div>
          )}
        </Link>

        {/* Title & Code */}
        <div className="p-3.5 sm:p-4">
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#1F1E1D] line-clamp-1 group-hover:text-[#6B3A2A] transition-colors mb-1">
            {product.title}
          </h3>
          <span className="text-[11px] font-mono text-[#78716C] block">
            {codeDisplay}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Lock banner vs Authenticated price */}
      <div className="p-3.5 sm:p-4 pt-0">
        {!isAuthenticated ? (
          <Link
            href="/acceso"
            className="w-full bg-[#F4EFE8] hover:bg-[#EAE3D8] text-[#6E6862] hover:text-[#1F1E1D] text-[11px] font-medium py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#E8E2D8]"
          >
            <Lock className="w-3.5 h-3.5 text-[#8C7355]" />
            <span>Iniciá sesión para ver precios y stock</span>
          </Link>
        ) : (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between bg-[#FAF8F5] p-2 rounded-lg border border-[#E8E2D8]">
              <span className="text-[10px] uppercase font-semibold text-[#78716C]">
                Mayorista (+IVA):
              </span>
              <span className="font-mono text-sm font-bold text-[#1F1E1D]">
                {formatCurrencyARS(unitPrice)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-[#D6CFC4] rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-2 py-1 text-xs text-[#78716C] hover:bg-[#F4EFE8]"
                >
                  -
                </button>
                <span className="px-2 text-xs font-mono font-bold text-[#1F1E1D]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="px-2 py-1 text-xs text-[#78716C] hover:bg-[#F4EFE8]"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#1C3B2B] hover:bg-[#14291E] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Agregado</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
    volumeTiers: [],
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
    volumeTiers: [],
    packUnit: 'Par',
    inStock: true,
    thumbnail: '/images/products/riendas-cuero-vacuno.jpg',
  },
  {
    id: 'feat-3',
    title: 'Cinturón de polo',
    handle: 'cinturon-de-polo',
    sku: 'C078',
    variantId: 'v3',
    basePrice: 62000,
    wholesalePrice: 41000,
    volumeTiers: [],
    packUnit: 'Unidad',
    inStock: true,
    thumbnail: '/images/products/cinturon-polo.jpg',
  },
  {
    id: 'feat-4',
    title: 'Pechera tejida artesanal',
    handle: 'pechera-tejida-artesanal',
    sku: 'T032',
    variantId: 'v4',
    basePrice: 95000,
    wholesalePrice: 64000,
    volumeTiers: [],
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
    volumeTiers: [],
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
    volumeTiers: [],
    packUnit: 'Unidad',
    inStock: true,
    thumbnail: '/images/products/cabezada-cuero.jpg',
  },
]

export function FeaturedWholesaleProducts({ products }: FeaturedWholesaleProps) {
  // Use live Medusa products if available, with fallback to mockup reference 6 items
  const displayItems = products.length >= 6 ? products.slice(0, 6) : FALLBACK_FEATURED

  return (
    <section className="bg-[#FAF8F5] py-14 sm:py-16 border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F1E1D] tracking-tight">
              Productos destacados
            </h2>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#1C3B2B] hover:text-[#14291E] transition-colors group"
          >
            <span>Ver todos los productos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 6 Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayItems.map((product, idx) => (
            <FeaturedWholesaleCard
              key={product.id || idx}
              product={product}
              codeOverride={FALLBACK_FEATURED[idx]?.sku ? `Cód. ${FALLBACK_FEATURED[idx].sku}` : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
