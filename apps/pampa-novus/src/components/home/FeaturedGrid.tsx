import React from 'react'
import Link from 'next/link'
import type { StorefrontProduct } from '@/lib/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { ArrowRight } from 'lucide-react'

interface FeaturedGridProps {
  products: StorefrontProduct[]
}

export function FeaturedGrid({ products }: FeaturedGridProps) {
  // Display up to 6 products matching the mockup's 6-card row on desktop
  const displayProducts = products.slice(0, 6)

  return (
    <section className="py-9 sm:py-12 bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Section Header with fine horizontal line separator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-7 gap-3">
          <div className="flex items-center space-x-4 flex-1">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-pn-cognac font-sans font-medium block">
                PRODUCTOS DESTACADOS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold text-pn-espresso tracking-tight">
                Nuestra selección
              </h2>
            </div>
            {/* Fine decorative rule spanning across */}
            <div className="hidden md:block flex-1 max-w-sm h-[1.5px] bg-[#D9C9A8]/70 mt-3" />
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-sans text-pn-marron hover:text-pn-cognac font-medium transition-colors group self-start sm:self-auto"
          >
            <span>Ver todos los productos</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2px] border border-[#EFE8DE]">
            <p className="text-xs sm:text-sm text-pn-espresso/70 font-sans">
              Cargando catálogo oficial desde Staging...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 lg:gap-4 xl:gap-4.5">
            {displayProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={idx === 0 ? 'DESTACADO' : idx === 2 ? 'NUEVO' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedGrid
