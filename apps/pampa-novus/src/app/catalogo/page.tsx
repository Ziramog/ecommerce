import React from 'react'
import Link from 'next/link'
import { getB2CProducts, STATIC_B2C_FALLBACK_PRODUCTS, StorefrontProduct } from '@/lib/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { SlidersHorizontal, ArrowLeft } from 'lucide-react'

export const revalidate = 60

interface CatalogoPageProps {
  searchParams?: Promise<{ categoria?: string; q?: string }>
}

const CATEGORY_FILTERS = [
  { name: 'Todas las piezas', slug: '' },
  { name: 'Monturas', slug: 'monturas' },
  { name: 'Accesorios', slug: 'accesorios' },
  { name: 'Marroquinería', slug: 'marroquineria' },
  { name: 'Campo', slug: 'campo' },
  { name: 'Regalos', slug: 'regalos' },
]

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const params = searchParams ? await searchParams : {}
  let allProducts: StorefrontProduct[] = []
  try {
    allProducts = await getB2CProducts()
  } catch (err) {
    console.warn('[CatalogoPage] Error al obtener productos del backend:', err)
    allProducts = STATIC_B2C_FALLBACK_PRODUCTS
  }

  // Filter products if search or category is active
  let filteredProducts = allProducts

  if (params.categoria) {
    const cat = params.categoria.toLowerCase()
    filteredProducts = filteredProducts.filter((p) => {
      const text = `${p.title} ${p.description || ''} ${p.handle}`.toLowerCase()
      if (cat === 'monturas') return text.includes('montura') || text.includes('bastos')
      if (cat === 'accesorios') return text.includes('bozal') || text.includes('riendas') || text.includes('freno') || text.includes('cabezada')
      if (cat === 'marroquineria') return text.includes('cinturon') || text.includes('carpincho') || text.includes('lonja')
      if (cat === 'campo') return text.includes('estribo') || text.includes('cincha') || text.includes('cinchon') || text.includes('manta')
      if (cat === 'regalos') return text.includes('cuchillo') || text.includes('mate')
      return true
    })
  }

  if (params.q) {
    const q = params.q.toLowerCase()
    filteredProducts = filteredProducts.filter((p) =>
      `${p.title} ${p.description || ''} ${p.sku}`.toLowerCase().includes(q)
    )
  }

  return (
    <div className="py-8 sm:py-12 bg-[#FAF7F2] min-h-[70vh]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Breadcrumb / Return to Home */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.16em] text-pn-cognac hover:text-pn-espresso transition-colors font-medium"
          >
            <ArrowLeft size={13} />
            <span>Volver a la Home</span>
          </Link>
        </div>

        {/* Header Editorial con Jerarquía Oficial */}
        <div className="mb-8">
          <span className="text-[11px] uppercase tracking-[0.22em] text-pn-cognac font-sans font-medium block mb-1.5">
            PAMPA NOVUS · COLECCIÓN OFICIAL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-pn-espresso tracking-tight mb-2.5">
            Catálogo de Piezas Criollas
          </h1>
          <p className="text-xs sm:text-sm text-pn-espresso/80 font-sans leading-relaxed max-w-2xl font-light">
            Explorá nuestra selección de piezas en suela vacuna seleccionada, carpincho y platería criolla tradicional con inventario digital unificado y precio minorista oficial.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#EFE8DE]">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = (params.categoria || '') === cat.slug
            return (
              <Link
                key={cat.slug}
                href={cat.slug ? `/catalogo?categoria=${cat.slug}` : '/catalogo'}
                className={`px-3.5 py-1.5 text-[11px] sm:text-xs uppercase tracking-[0.14em] font-sans font-medium rounded-[2px] transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-pn-marron text-white shadow-sm'
                    : 'bg-[#F5EBDD]/70 hover:bg-[#F5EBDD] text-pn-espresso border border-[#D9C9A8]/50'
                }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>

        {/* Toolbar de Conteo y Moneda */}
        <div className="flex items-center justify-between pb-4 mb-6 text-xs text-pn-espresso/75 border-b border-[#EFE8DE]/60 font-sans">
          <div>
            Mostrando <span className="font-semibold text-pn-espresso">{filteredProducts.length} piezas</span> disponibles
            {params.categoria && <span className="text-pn-cognac ml-1 font-medium">({params.categoria})</span>}
            {params.q && <span className="text-pn-cognac ml-1">búsqueda: &quot;{params.q}&quot;</span>}
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline text-pn-espresso/60 text-[11px]">Moneda: ARS ($)</span>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-[#EFE8DE] rounded-[2px] text-[11px] text-pn-espresso">
              <SlidersHorizontal size={12} className="text-pn-cognac" />
              <span>Minorista B2C</span>
            </div>
          </div>
        </div>

        {/* Products Grid: 4 columnas en desktop grande, 3 en desktop medio, 2 en mobile */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2px] border border-[#EFE8DE]">
            <p className="text-sm text-pn-espresso/80 font-sans mb-3">
              No se encontraron piezas para los filtros seleccionados.
            </p>
            <Link
              href="/catalogo"
              className="text-xs uppercase tracking-wider text-pn-marron underline underline-offset-4"
            >
              Ver todo el catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                aspectRatioClass="aspect-[4/3]"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
