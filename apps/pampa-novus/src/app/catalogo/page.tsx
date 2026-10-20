import React from 'react'
import { getB2CProducts } from '@/lib/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { Filter, SlidersHorizontal } from 'lucide-react'

export const revalidate = 60

export default async function CatalogoPage() {
  const products = await getB2CProducts()

  return (
    <div className="py-12 bg-pampa-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-leather font-semibold block mb-2">
            Pampa Novus Retail
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pampa-950 tracking-tight mb-4">
            Catálogo Criollo
          </h1>
          <p className="text-sm text-pampa-600 leading-relaxed">
            Explorá nuestra selección de piezas en suela vacuna, carpincho y platería criolla tradicional con disponibilidad digital inmediata y precio minorista garantizado.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-8 border-b border-pampa-200 gap-4">
          <div className="text-xs text-pampa-600">
            Mostrando <span className="font-semibold text-pampa-950">{products.length} productos</span> disponibles
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="text-pampa-500 hidden sm:inline">Precios en Pesos Argentinos (ARS)</span>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-pampa-200 rounded text-pampa-700">
              <SlidersHorizontal size={14} className="text-leather" />
              <span>Canal Minorista B2C</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
