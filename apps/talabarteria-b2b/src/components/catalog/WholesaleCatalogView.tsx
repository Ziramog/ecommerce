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

    // 4. Availability Filter
    if (filters.availability.length > 0) {
      result = result.filter((p) => {
        const meta = getProductMetadata(p)
        const isPack =
          p.packUnit?.toLowerCase().includes('pack') ||
          p.handle.toLowerCase().includes('pack')

        return filters.availability.some((av) => {
          if (av === 'En stock') return p.inStock
          if (av === 'Próximamente') return !p.inStock
          if (av === 'Pack cerrado') return isPack
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
    <div className="bg-[#FAF8F5] min-h-screen py-2.5 sm:py-3.5 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-[#78716C] mb-2 font-medium">
          <Link href="/" className="hover:text-[#1F1E1D] flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
          <Link href="/catalogo" className="hover:text-[#1F1E1D] transition-colors">
            Catálogo Comercial
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
          <span className="text-[#1F1E1D] font-semibold">Lista de Precios Mayorista</span>
        </nav>

        {/* 2. Hero Banner de Lista de Precios Compacto */}
        <div className="relative bg-white border border-[#E8E2D8] rounded-xl py-2.5 px-4 sm:px-6 mb-3 sm:mb-4 overflow-hidden shadow-2xs">
          {/* Fondo Faded Ecuestre a la derecha */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <Image
              src="/images/home/hero-polo-action.jpg"
              alt="Talabartería Mayorista"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A311F] font-bold block leading-none mb-1">
                Catálogo Comercial
              </span>

              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-[#1F1E1D] uppercase tracking-tight leading-snug">
                  LISTA DE PRECIOS MAYORISTA
                </h1>
                <span className="text-xs text-[#57534E]">
                  • Precios netos en pesos argentinos (ARS).
                </span>
              </div>
            </div>

            {/* Bloque Derecho: Tradición que equipa tu negocio + Botón Matriz */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-2.5 text-right">
                <div className="w-[1.5px] h-7 bg-[#D6CFC4]" />
                <div className="text-[8px] uppercase tracking-[0.18em] text-[#78716C] font-serif leading-tight">
                  <span className="block font-bold text-[#8A311F]">Tradición</span>
                  <span className="block font-medium">Que Equipa Tu Negocio</span>
                </div>
              </div>

              <Link
                href="/pedido-rapido"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#15232A] hover:bg-[#1E333F] text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs group"
              >
                <Layers className="w-3.5 h-3.5 text-[#C86D51] group-hover:scale-110 transition-transform" />
                <span>MODO CARGA MASIVA (MATRIZ)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Layout Principal Marketplace: Sidebar Filtros + Grilla de Productos */}
        <div className="flex gap-5 lg:gap-6 items-start">
          {/* A. Sidebar Izquierdo de Filtros (Desktop) */}
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
            {/* Barra Superior de Control: Resultados, Filtrar (Mobile), Ordenar y Vista */}
            <div className="bg-white border border-[#E8E2D8] rounded-lg py-2 px-3 sm:px-4 mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
              {/* Total Resultados */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#1F1E1D]">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
                <span className="text-[#A8A29E]">|</span>
                <span className="text-[#57534E]">
                  Mostrando 1–{filteredProducts.length} de {products.length} resultados
                </span>
              </div>

              {/* Acciones Derecha */}
              <div className="flex items-center gap-2.5">
                {/* Botón Filtrar para Mobile / Drawer */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D6CFC4] hover:bg-[#FAF8F5] text-xs font-semibold text-[#1F1E1D] transition-colors"
                >
                  <Filter className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#8A311F] text-white text-[9px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Selector Ordenar por */}
                <div className="flex items-center gap-1.5 text-xs text-[#57534E]">
                  <span className="hidden sm:inline font-medium">Ordenar:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-[#D6CFC4] rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-semibold text-[#1F1E1D] focus:outline-none focus:border-[#8A311F] cursor-pointer"
                    >
                      <option value="relevantes">Más relevantes</option>
                      <option value="menor-precio">Menor precio</option>
                      <option value="mayor-precio">Mayor precio</option>
                      <option value="nombre-az">Nombre A-Z</option>
                      <option value="sku">Código SKU</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-[#78716C] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Selector de Modo Vista (Grid vs List) */}
                <div className="flex items-center border border-[#D6CFC4] rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#8A311F] text-white'
                        : 'text-[#78716C] hover:bg-[#FAF8F5]'
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
                        ? 'bg-[#8A311F] text-white'
                        : 'text-[#78716C] hover:bg-[#FAF8F5]'
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
              <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                <span className="text-[11px] text-[#78716C] font-medium mr-1">
                  Filtros activos:
                </span>

                {/* Búsqueda */}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF6F0] border border-[#E8E2D8] text-[#1F1E1D]">
                    Búsqueda: &quot;{searchQuery}&quot;
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="hover:text-[#8A311F]"
                      aria-label="Eliminar búsqueda"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Disciplina */}
                {activeDisciplina && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF6F0] border border-[#E8E2D8] text-[#1F1E1D] uppercase">
                    Disciplina: {activeDisciplina}
                    <button
                      type="button"
                      onClick={() => setActiveDisciplina('')}
                      className="hover:text-[#8A311F]"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF6F0] border border-[#E8E2D8] text-[#1F1E1D]"
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
                      className="hover:text-[#8A311F]"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF6F0] border border-[#E8E2D8] text-[#1F1E1D]"
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
                      className="hover:text-[#8A311F]"
                      aria-label={`Eliminar filtro ${av}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Rango de precio */}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF6F0] border border-[#E8E2D8] text-[#1F1E1D]">
                    ${filters.minPrice || '0'} – ${filters.maxPrice || '∞'}
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({ ...filters, minPrice: '', maxPrice: '' })
                      }
                      className="hover:text-[#8A311F]"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF6F0] border border-[#E8E2D8] text-[#1F1E1D]"
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
                      className="hover:text-[#8A311F]"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF6F0] border border-[#E8E2D8] text-[#1F1E1D]"
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
                      className="hover:text-[#8A311F]"
                      aria-label={`Eliminar material ${mat}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-[#8A311F] hover:underline ml-1"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* C. Grilla o Lista de Productos */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#E8E2D8] rounded-2xl shadow-2xs">
                <p className="text-sm font-semibold text-[#1F1E1D] mb-1">
                  No se encontraron productos para los filtros seleccionados.
                </p>
                <p className="text-xs text-[#57534E] mb-4">
                  Probá ajustando la búsqueda, seleccionando otra categoría o limpiando los filtros.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8A311F] hover:bg-[#722718] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Restablecer filtros</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grilla Marketplace: 4 columnas en pantallas grandes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 min-[1440px]:grid-cols-4 gap-4 sm:gap-4.5">
                {filteredProducts.map((product) => (
                  <ProductCardB2B key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Modo Lista Horizontal */
              <div className="flex flex-col gap-3">
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
    <div className="bg-white border border-[#E8E2D8] rounded-xl p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Thumbnail + Info */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Link
          href={`/productos/${product.handle}`}
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8] overflow-hidden flex-shrink-0 group"
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-[#A8A29E]">
              Sin foto
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#18261E] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
              {product.sku || 'SKU'}
            </span>
            {isPack ? (
              <span className="bg-[#FAF6F0] text-[#8A311F] text-[9px] font-semibold px-1.5 py-0.5 rounded border border-[#E8E2D8]">
                Pack cerrado
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-emerald-100">
                En stock
              </span>
            )}
          </div>

          <h3 className="font-serif text-sm sm:text-base font-bold text-[#1F1E1D] hover:text-[#8A311F] transition-colors line-clamp-1 mb-1">
            <Link href={`/productos/${product.handle}`}>{product.title}</Link>
          </h3>

          <p className="text-xs text-[#57534E] line-clamp-1 font-normal mb-1">
            {product.description || 'Artículo de talabartería tradicional.'}
          </p>

          <span className="text-[11px] text-[#78716C]">
            Presentación: <strong className="text-[#1F1E1D]">{product.packUnit || 'Unidad'}</strong>
          </span>
        </div>
      </div>

      {/* Precios, Tiers y Compra */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#E8E2D8]">
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-[#78716C] block leading-none mb-0.5">
            Precio mayorista
          </span>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="font-serif text-lg sm:text-xl font-bold text-[#1F1E1D] leading-none">
              {formatCurrencyARS(unitPrice)}
            </span>
            <span className="text-xs text-[#78716C]">/{isPack ? 'pack' : 'un'}</span>
          </div>
        </div>

        {/* Stepper + Botón Agregar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#D6CFC4] rounded-lg bg-white h-9">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-2.5 h-full text-[#57534E] hover:bg-[#FAF8F5] text-sm font-bold transition-colors rounded-l-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-8 text-center text-xs font-mono font-bold text-[#1F1E1D] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="px-2.5 h-full text-[#57534E] hover:bg-[#FAF8F5] text-sm font-bold transition-colors rounded-r-lg"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#15232A] hover:bg-[#1E333F] text-white active:scale-[0.98]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
