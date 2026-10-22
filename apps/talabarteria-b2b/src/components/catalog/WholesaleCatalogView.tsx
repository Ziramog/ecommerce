'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { B2BProduct } from '@/lib/catalog'
import { ProductCardB2B } from './ProductCardB2B'
import {
  CatalogSidebarFilters,
  FilterState,
  getProductMetadata,
} from './CatalogSidebarFilters'
import { formatCurrencyARS, calculateVolumeDiscount, DEFAULT_VOLUME_TIERS } from '@/lib/utils'
import { useB2BCart } from '@/context/B2BCartContext'
import {
  Home,
  ChevronRight,
  Layers,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  ShoppingCart,
  Check,
} from 'lucide-react'

interface WholesaleCatalogViewProps {
  products: B2BProduct[]
}

const INITIAL_FILTERS: FilterState = {
  categories: [],
  availability: [],
  minPrice: '',
  maxPrice: '',
  presentations: [],
  materials: [],
}

export function WholesaleCatalogView({ products }: WholesaleCatalogViewProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const queryParam = searchParams.get('q') || ''
  const catParam = searchParams.get('categoria') || ''
  const discParam = searchParams.get('disciplina') || ''

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    categories: catParam ? [catParam] : [],
  }))

  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [activeDisciplina, setActiveDisciplina] = useState(discParam)
  const [sortBy, setSortBy] = useState<string>('relevantes')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Keep state synced if URL changes
  useEffect(() => {
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam)
    }
  }, [queryParam])

  useEffect(() => {
    if (catParam) {
      setFilters((prev) => ({
        ...prev,
        categories: [catParam],
      }))
    }
  }, [catParam])

  useEffect(() => {
    setActiveDisciplina(discParam)
  }, [discParam])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.categories.length > 0) count += filters.categories.length
    if (filters.availability.length > 0) count += filters.availability.length
    if (filters.presentations.length > 0) count += filters.presentations.length
    if (filters.materials.length > 0) count += filters.materials.length
    if (filters.minPrice || filters.maxPrice) count += 1
    if (searchQuery) count += 1
    if (activeDisciplina) count += 1
    return count
  }, [filters, searchQuery, activeDisciplina])

  const handleClearAll = () => {
    setFilters(INITIAL_FILTERS)
    setSearchQuery('')
    setActiveDisciplina('')
    router.push('/catalogo')
  }

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // 1. Text Search Filter (title, sku, description, handle)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.handle.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }

    // 2. Discipline Filter (from header link ?disciplina=polo|salto|turf)
    if (activeDisciplina) {
      const disc = activeDisciplina.toLowerCase()
      result = result.filter(
        (p) =>
          p.handle.toLowerCase().includes(disc) ||
          p.title.toLowerCase().includes(disc) ||
          (p.description && p.description.toLowerCase().includes(disc))
      )
    }

    // 3. Category Filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => {
        const meta = getProductMetadata(p)
        return filters.categories.includes(meta.category)
      })
    }

    // 4. Availability Filter (En stock / Próximamente)
    if (filters.availability.length > 0) {
      result = result.filter((p) => {
        return filters.availability.some((av) => {
          if (av === 'En stock') return p.inStock
          if (av === 'Próximamente') return !p.inStock
          return false
        })
      })
    }

    // 5. Price Range Filter
    if (filters.minPrice) {
      const min = parseInt(filters.minPrice)
      if (!isNaN(min)) {
        result = result.filter((p) => p.wholesalePrice >= min)
      }
    }
    if (filters.maxPrice) {
      const max = parseInt(filters.maxPrice)
      if (!isNaN(max)) {
        result = result.filter((p) => p.wholesalePrice <= max)
      }
    }

    // 6. Presentation Filter
    if (filters.presentations.length > 0) {
      result = result.filter((p) => {
        const meta = getProductMetadata(p)
        return filters.presentations.includes(meta.presentation)
      })
    }

    // 7. Material Filter
    if (filters.materials.length > 0) {
      result = result.filter((p) => {
        const meta = getProductMetadata(p)
        return filters.materials.includes(meta.material)
      })
    }

    // 8. Sorting
    if (sortBy === 'menor-precio') {
      result.sort((a, b) => a.wholesalePrice - b.wholesalePrice)
    } else if (sortBy === 'mayor-precio') {
      result.sort((a, b) => b.wholesalePrice - a.wholesalePrice)
    } else if (sortBy === 'nombre-az') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'sku') {
      result.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''))
    }

    return result
  }, [products, searchQuery, activeDisciplina, filters, sortBy])

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-4 font-sans text-[#202020]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* 1. Breadcrumbs Mercado Libre Style */}
        <nav className="flex items-center gap-1.5 text-xs text-[#737373] mb-3 font-medium">
          <Link href="/" className="hover:text-[#172B23] flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
          <span className="text-[#D4D4D4]">/</span>
          <Link href="/catalogo" className="hover:text-[#172B23] transition-colors">
            Catálogo Comercial
          </Link>
          <span className="text-[#D4D4D4]">/</span>
          <span className="text-[#202020] font-semibold">Lista de Precios Mayorista</span>
        </nav>

        {/* 2. Cabecera Comercial Integrada (Full Width, sin cajas flotantes ni banners redondeados) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 mb-3 border-b border-[#E5E5E5]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#873427] font-bold block mb-1">
              Catálogo Comercial
            </span>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#202020] uppercase tracking-tight leading-tight">
                LISTA DE PRECIOS MAYORISTA
              </h1>
              <span className="text-xs text-[#737373]">
                • Precios netos en pesos argentinos (ARS).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/pedido-rapido"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#172B23] hover:bg-[#0F1D17] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs group"
            >
              <Layers className="w-3.5 h-3.5 text-[#C86D51] group-hover:scale-105 transition-transform" />
              <span>MODO CARGA MASIVA (MATRIZ)</span>
            </Link>
          </div>
        </div>

        {/* 3. Layout Principal Marketplace: Sidebar Filtros + Grilla de Productos */}
        <div className="flex gap-5 lg:gap-6 items-start">
          {/* A. Sidebar Izquierdo de Filtros (Desktop: 240px a 260px) */}
          <aside className="w-60 xl:w-64 flex-shrink-0 hidden lg:block sticky top-28 self-start">
            <CatalogSidebarFilters
              products={products}
              filters={filters}
              onFilterChange={setFilters}
              onClearAll={handleClearAll}
              totalFilteredCount={filteredProducts.length}
            />
          </aside>

          {/* B. Área Principal de Productos */}
          <main className="flex-1 min-w-0">
            {/* Barra Horizontal Compacta de Herramientas (48px de alto, bordes 4px, fondo blanco limpio) */}
            <div className="bg-white border border-[#E5E5E5] rounded h-12 px-3 sm:px-4 mb-3 flex items-center justify-between gap-3">
              {/* Total Resultados */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs truncate">
                <span className="font-bold text-[#202020] whitespace-nowrap">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
                <span className="text-[#D4D4D4] hidden sm:inline">|</span>
                <span className="text-[#737373] hidden sm:inline truncate">
                  Mostrando 1–{filteredProducts.length} de {products.length} resultados
                </span>
              </div>

              {/* Acciones Derecha */}
              <div className="flex items-center gap-2.5">
                {/* Botón Filtrar para Mobile / Drawer */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-xs font-semibold text-[#202020] transition-colors"
                >
                  <Filter className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#873427] text-white text-[9px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Selector Ordenar por */}
                <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                  <span className="hidden sm:inline font-medium">Ordenar:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-[#E5E5E5] rounded pl-2.5 pr-7 py-1.5 text-xs font-semibold text-[#202020] focus:outline-none focus:border-[#873427] cursor-pointer"
                    >
                      <option value="relevantes">Más relevantes</option>
                      <option value="menor-precio">Menor precio</option>
                      <option value="mayor-precio">Mayor precio</option>
                      <option value="nombre-az">Nombre A-Z</option>
                      <option value="sku">Código SKU</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-[#737373] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Selector de Modo Vista (Grid vs List) */}
                <div className="flex items-center border border-[#E5E5E5] rounded overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#172B23] text-white'
                        : 'text-[#737373] hover:bg-[#F5F5F5]'
                    }`}
                    aria-label="Vista cuadrícula"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#172B23] text-white'
                        : 'text-[#737373] hover:bg-[#F5F5F5]'
                    }`}
                    aria-label="Vista lista"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Píldoras de Filtros Activos */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-[11px] text-[#737373] font-medium mr-1">
                  Filtros activos:
                </span>

                {/* Búsqueda */}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#E5E5E5] text-[#202020]">
                    Búsqueda: &quot;{searchQuery}&quot;
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="hover:text-[#873427]"
                      aria-label="Eliminar búsqueda"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Disciplina */}
                {activeDisciplina && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#E5E5E5] text-[#202020] uppercase">
                    Disciplina: {activeDisciplina}
                    <button
                      type="button"
                      onClick={() => setActiveDisciplina('')}
                      className="hover:text-[#873427]"
                      aria-label="Eliminar disciplina"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Categorías */}
                {filters.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#E5E5E5] text-[#202020]"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          categories: filters.categories.filter((c) => c !== cat),
                        })
                      }
                      className="hover:text-[#873427]"
                      aria-label={`Eliminar filtro ${cat}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Disponibilidad */}
                {filters.availability.map((av) => (
                  <span
                    key={av}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#E5E5E5] text-[#202020]"
                  >
                    {av}
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          availability: filters.availability.filter((a) => a !== av),
                        })
                      }
                      className="hover:text-[#873427]"
                      aria-label={`Eliminar filtro ${av}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Rango de precio */}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#E5E5E5] text-[#202020]">
                    ${filters.minPrice || '0'} – ${filters.maxPrice || '∞'}
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({ ...filters, minPrice: '', maxPrice: '' })
                      }
                      className="hover:text-[#873427]"
                      aria-label="Eliminar filtro precio"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Presentación */}
                {filters.presentations.map((pr) => (
                  <span
                    key={pr}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#E5E5E5] text-[#202020]"
                  >
                    {pr}
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          presentations: filters.presentations.filter((p) => p !== pr),
                        })
                      }
                      className="hover:text-[#873427]"
                      aria-label={`Eliminar presentación ${pr}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Material */}
                {filters.materials.map((mat) => (
                  <span
                    key={mat}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#E5E5E5] text-[#202020]"
                  >
                    {mat}
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          materials: filters.materials.filter((m) => m !== mat),
                        })
                      }
                      className="hover:text-[#873427]"
                      aria-label={`Eliminar material ${mat}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-[#873427] hover:underline ml-1"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* C. Grilla o Lista de Productos */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#E5E5E5] rounded">
                <p className="text-sm font-semibold text-[#202020] mb-1">
                  No se encontraron productos para los filtros seleccionados.
                </p>
                <p className="text-xs text-[#737373] mb-4">
                  Probá ajustando la búsqueda, seleccionando otra categoría o limpiando los filtros.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#873427] hover:bg-[#6D271D] text-white text-xs font-bold transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Restablecer filtros</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grilla Marketplace: 4 columnas en desktop amplio, cada producto en su propia celda sin desbordes */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
                {filteredProducts.map((product) => (
                  <ProductCardB2B key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Modo Lista Horizontal */
              <div className="flex flex-col gap-2.5">
                {filteredProducts.map((product) => (
                  <WholesaleProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal / Drawer de Filtros para Mobile */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl p-4 overflow-y-auto z-10">
            <CatalogSidebarFilters
              products={products}
              filters={filters}
              onFilterChange={setFilters}
              onClearAll={handleClearAll}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setMobileFilterOpen(false)}
              totalFilteredCount={filteredProducts.length}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Compact horizontal row representation for list view mode
function WholesaleProductListItem({ product }: { product: B2BProduct }) {
  const { addItem } = useB2BCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const activeTiers =
    product.volumeTiers && product.volumeTiers.length > 0
      ? product.volumeTiers
      : DEFAULT_VOLUME_TIERS

  const { unitPrice } = calculateVolumeDiscount(
    product.wholesalePrice,
    qty,
    activeTiers
  )

  const isPack =
    product.packUnit?.toLowerCase().includes('pack') ||
    product.handle.toLowerCase().includes('pack')

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded p-3 sm:p-4 hover:border-[#B49272] transition-colors flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Thumbnail + Info */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Link
          href={`/productos/${product.handle}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xs bg-[#FAFAFA] border border-[#E5E5E5] overflow-hidden flex-shrink-0 group"
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-[#A3A3A3]">
              Sin foto
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#172B23] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs">
              {product.sku || 'SKU'}
            </span>
            {isPack ? (
              <span className="bg-[#F5F5F5] text-[#873427] text-[9px] font-semibold px-1.5 py-0.5 rounded-xs border border-[#E5E5E5]">
                Pack cerrado
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-xs border border-emerald-200">
                En stock
              </span>
            )}
          </div>

          <h3 className="font-sans text-sm sm:text-base font-bold text-[#202020] hover:text-[#873427] transition-colors line-clamp-1 mb-1">
            <Link href={`/productos/${product.handle}`}>{product.title}</Link>
          </h3>

          <p className="text-xs text-[#525252] line-clamp-1 font-normal mb-1">
            {product.description || 'Artículo de talabartería tradicional.'}
          </p>

          <span className="text-[11px] text-[#737373]">
            Presentación: <strong className="text-[#202020]">{product.packUnit || 'Unidad'}</strong>
          </span>
        </div>
      </div>

      {/* Precios, Tiers y Compra */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#E5E5E5]">
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-[#737373] block leading-none mb-0.5">
            Precio mayorista
          </span>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="font-sans text-lg sm:text-xl font-extrabold text-[#202020] leading-none">
              {formatCurrencyARS(unitPrice)}
            </span>
            <span className="text-xs text-[#525252] font-semibold">/{isPack ? 'pack' : 'un'}</span>
          </div>
        </div>

        {/* Stepper + Botón Agregar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#D4D4D4] rounded bg-white h-8">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-2 h-full text-[#525252] hover:bg-[#F5F5F5] text-xs font-bold transition-colors"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-8 text-center text-xs font-mono font-bold text-[#202020] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="px-2 h-full text-[#525252] hover:bg-[#F5F5F5] text-xs font-bold transition-colors"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`h-8 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#172B23] hover:bg-[#0F1D17] text-white active:scale-[0.98]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
                <span className="truncate">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
