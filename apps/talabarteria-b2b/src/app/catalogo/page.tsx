import React from 'react'
import Link from 'next/link'
import { getB2BProducts } from '@/lib/catalog'
import { WholesaleProductCard } from '@/components/catalog/WholesaleProductCard'
import { Layers } from 'lucide-react'

export const revalidate = 60

export default async function CatalogoPage() {
  const products = await getB2BProducts()

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-b2b-200 gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-saddle tracking-widest block mb-1">
            Catálogo Comercial
          </span>
          <h1 className="font-heading text-3xl font-bold text-navy uppercase">
            Lista de Precios Mayorista B2B
          </h1>
          <p className="text-xs text-b2b-500 mt-1">
            Mostrando {products.length} líneas habilitadas en el canal mayorista. Precios netos en pesos argentinos (ARS).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pedido-rapido"
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-navy hover:bg-navy-light text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4 text-saddle-light" />
            Modo Carga Masiva (Matriz)
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <WholesaleProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
