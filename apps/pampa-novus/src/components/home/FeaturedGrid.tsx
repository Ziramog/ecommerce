import React from 'react'
import Link from 'next/link'
import type { StorefrontProduct } from '@/lib/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { ArrowRight } from 'lucide-react'

interface FeaturedGridProps {
  products: StorefrontProduct[]
}

export function FeaturedGrid({ products }: FeaturedGridProps) {
  return (
    <section className="py-20 bg-pampa-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-leather font-semibold block mb-2">
              Catálogo Minorista
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-pampa-950 tracking-tight">
              Piezas Maestras Destacadas
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.18em] font-semibold text-leather hover:text-leather-dark mt-4 md:mt-0 group"
          >
            <span>Ver Colección Completa ({products.length})</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded border border-pampa-200">
            <p className="text-sm text-pampa-600">Conectando con el catálogo de Staging...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
