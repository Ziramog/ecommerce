'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, X, Check, ArrowRight } from 'lucide-react'
import { B2BProduct } from '@/lib/catalog'

export interface FilterState {
  categories: string[]
  availability: string[]
  minPrice: string
  maxPrice: string
  presentations: string[]
  materials: string[]
}

interface CatalogSidebarFiltersProps {
  products: B2BProduct[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearAll: () => void
  isMobileDrawer?: boolean
  onCloseMobileDrawer?: () => void
  totalFilteredCount?: number
}

// Helper to deduce category, material, presentation from product data
export function getProductMetadata(p: B2BProduct) {
  const h = p.handle.toLowerCase()
  const t = p.title.toLowerCase()

  // Category
  let category = 'Otros productos'
  if (h.includes('montura') || t.includes('montura')) category = 'Monturas'
  else if (h.includes('bozal') || h.includes('lonja') || h.includes('cinchon') || h.includes('rienda') || t.includes('bozal') || t.includes('lonja') || t.includes('cinchón') || t.includes('rienda') || t.includes('apero')) category = 'Aperos'
  else if (h.includes('cinturon') || t.includes('cinturón') || t.includes('cinturon')) category = 'Cinturones'
  else if (h.includes('freno') || h.includes('estribo') || h.includes('espuela') || t.includes('freno') || t.includes('estribo') || t.includes('espuela')) category = 'Herrajes'
  else if (h.includes('manta') || h.includes('pechera') || h.includes('sudadero') || t.includes('manta') || t.includes('pechera') || t.includes('accesorio')) category = 'Accesorios'
  else if (h.includes('grasa') || h.includes('potro') || t.includes('grasa') || t.includes('cuero')) category = 'Cuidado del cuero'

  // Material
  let material = 'Cuero vacuno'
  if (h.includes('acero') || h.includes('freno') || h.includes('estribo') || t.includes('acero') || t.includes('freno')) material = 'Acero inoxidable'
  else if (h.includes('alpaca') || t.includes('alpaca')) material = 'Alpaca'
  else if (h.includes('bronce') || t.includes('bronce')) material = 'Bronce'
  else if (h.includes('manta') || h.includes('lana') || t.includes('lana')) material = 'Lana pura'
  else if (h.includes('grasa') || t.includes('grasa')) material = 'Grasa y cera natural'

  // Presentation
  let presentation = 'Unidad'
  if (h.includes('pack') || p.packUnit?.toLowerCase().includes('pack')) presentation = 'Pack'
  else if (h.includes('caja') || p.packUnit?.toLowerCase().includes('caja')) presentation = 'Caja'

  // Availability
  const availability = p.inStock ? 'En stock' : 'Próximamente'

  return { category, material, presentation, availability }
}

export const CATEGORIES_LIST = [
  'Monturas',
  'Aperos',
  'Cinturones',
  'Herrajes',
  'Accesorios',
  'Cuidado del cuero',
  'Otros productos',
]

export const AVAILABILITY_LIST = ['En stock', 'Próximamente', 'Pack cerrado']

export const PRESENTATION_LIST = ['Unidad', 'Pack', 'Caja']

export const MATERIAL_LIST = [
  'Cuero vacuno',
  'Acero inoxidable',
  'Bronce',
  'Alpaca',
]

export function CatalogSidebarFilters({
  products,
  filters,
  onFilterChange,
  onClearAll,
  isMobileDrawer = false,
  onCloseMobileDrawer,
  totalFilteredCount = 0,
}: CatalogSidebarFiltersProps) {
  // Accordion state
  const [openCategories, setOpenCategories] = useState(true)
  const [openAvailability, setOpenAvailability] = useState(true)
  const [openPrice, setOpenPrice] = useState(true)
  const [openPresentation, setOpenPresentation] = useState(true)
  const [openMaterial, setOpenMaterial] = useState(true)

  // Local price input state
  const [tempMinPrice, setTempMinPrice] = useState(filters.minPrice)
  const [tempMaxPrice, setTempMaxPrice] = useState(filters.maxPrice)

  // Dynamic counts calculation
  const counts = React.useMemo(() => {
    const cMap: Record<string, number> = {}
    const aMap: Record<string, number> = {}
    const pMap: Record<string, number> = {}
    const mMap: Record<string, number> = {}

    // Initialize counts
    CATEGORIES_LIST.forEach((c) => (cMap[c] = 0))
    AVAILABILITY_LIST.forEach((a) => (aMap[a] = 0))
    PRESENTATION_LIST.forEach((p) => (pMap[p] = 0))
    MATERIAL_LIST.forEach((m) => (mMap[m] = 0))

    products.forEach((prod) => {
      const meta = getProductMetadata(prod)
      if (cMap[meta.category] !== undefined) cMap[meta.category]++
      if (aMap[meta.availability] !== undefined) aMap[meta.availability]++
      if (prod.packUnit?.toLowerCase().includes('pack')) aMap['Pack cerrado']++
      if (pMap[meta.presentation] !== undefined) pMap[meta.presentation]++
      if (mMap[meta.material] !== undefined) mMap[meta.material]++
    })

    return { cMap, aMap, pMap, mMap }
  }, [products])

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onFilterChange({ ...filters, categories: next })
  }

  const toggleAvailability = (item: string) => {
    const next = filters.availability.includes(item)
      ? filters.availability.filter((a) => a !== item)
      : [...filters.availability, item]
    onFilterChange({ ...filters, availability: next })
  }

  const togglePresentation = (item: string) => {
    const next = filters.presentations.includes(item)
      ? filters.presentations.filter((p) => p !== item)
      : [...filters.presentations, item]
    onFilterChange({ ...filters, presentations: next })
  }

  const toggleMaterial = (item: string) => {
    const next = filters.materials.includes(item)
      ? filters.materials.filter((m) => m !== item)
      : [...filters.materials, item]
    onFilterChange({ ...filters, materials: next })
  }

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({
      ...filters,
      minPrice: tempMinPrice,
      maxPrice: tempMaxPrice,
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.availability.length > 0 ||
    filters.presentations.length > 0 ||
    filters.materials.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== ''

  return (
    <div
      className={
        isMobileDrawer
          ? 'p-6 space-y-6 overflow-y-auto max-h-[85vh]'
          : 'space-y-6 select-none'
      }
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
        <h2 className="text-sm font-bold text-[#1F1E1D] tracking-wide uppercase">
          Filtros
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setTempMinPrice('')
              setTempMaxPrice('')
              onClearAll()
            }}
            className="text-xs text-[#8A311F] hover:underline font-semibold"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* 1. Categorías Accordion */}
      <div className="border-b border-[#E8E2D8] pb-4">
        <button
          type="button"
          onClick={() => setOpenCategories(!openCategories)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1F1E1D] uppercase tracking-wider mb-2.5"
        >
          <span>Categorías</span>
          {openCategories ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
          )}
        </button>

        {openCategories && (
          <div className="space-y-1.5 pt-1">
            {CATEGORIES_LIST.map((cat) => {
              const checked = filters.categories.includes(cat)
              const count = counts.cMap[cat] || 0
              return (
                <label
                  key={cat}
                  className="flex items-center justify-between text-xs text-[#57534E] hover:text-[#1F1E1D] cursor-pointer py-0.5 group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                      className="w-3.5 h-3.5 rounded border-[#D6CFC4] text-[#8A311F] focus:ring-[#8A311F] cursor-pointer"
                    />
                    <span className={checked ? 'font-bold text-[#1F1E1D]' : ''}>
                      {cat}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A8A29E] font-mono group-hover:text-[#78716C]">
                    ({count})
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Disponibilidad Accordion */}
      <div className="border-b border-[#E8E2D8] pb-4">
        <button
          type="button"
          onClick={() => setOpenAvailability(!openAvailability)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1F1E1D] uppercase tracking-wider mb-2.5"
        >
          <span>Disponibilidad</span>
          {openAvailability ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
          )}
        </button>

        {openAvailability && (
          <div className="space-y-1.5 pt-1">
            {AVAILABILITY_LIST.map((item) => {
              const checked = filters.availability.includes(item)
              const count = counts.aMap[item] || 0
              return (
                <label
                  key={item}
                  className="flex items-center justify-between text-xs text-[#57534E] hover:text-[#1F1E1D] cursor-pointer py-0.5 group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAvailability(item)}
                      className="w-3.5 h-3.5 rounded border-[#D6CFC4] text-[#8A311F] focus:ring-[#8A311F] cursor-pointer"
                    />
                    <span className={checked ? 'font-bold text-[#1F1E1D]' : ''}>
                      {item}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A8A29E] font-mono group-hover:text-[#78716C]">
                    ({count})
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. Precio (ARS) Accordion */}
      <div className="border-b border-[#E8E2D8] pb-4">
        <button
          type="button"
          onClick={() => setOpenPrice(!openPrice)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1F1E1D] uppercase tracking-wider mb-2.5"
        >
          <span>Precio (ARS)</span>
          {openPrice ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
          )}
        </button>

        {openPrice && (
          <form onSubmit={handleApplyPrice} className="pt-1 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín."
                value={tempMinPrice}
                onChange={(e) => setTempMinPrice(e.target.value)}
                className="w-full bg-white border border-[#D6CFC4] rounded-lg px-2.5 py-1.5 text-xs text-[#1F1E1D] placeholder-[#A8A29E] focus:outline-none focus:border-[#8A311F]"
              />
              <span className="text-[#A8A29E] text-xs font-bold">-</span>
              <input
                type="number"
                placeholder="Máx."
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(e.target.value)}
                className="w-full bg-white border border-[#D6CFC4] rounded-lg px-2.5 py-1.5 text-xs text-[#1F1E1D] placeholder-[#A8A29E] focus:outline-none focus:border-[#8A311F]"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-[#18261E] hover:bg-[#23382C] text-white flex items-center justify-center flex-shrink-0 transition-colors"
                title="Aplicar rango de precio"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. Tipo de presentación Accordion */}
      <div className="border-b border-[#E8E2D8] pb-4">
        <button
          type="button"
          onClick={() => setOpenPresentation(!openPresentation)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1F1E1D] uppercase tracking-wider mb-2.5"
        >
          <span>Tipo de presentación</span>
          {openPresentation ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
          )}
        </button>

        {openPresentation && (
          <div className="space-y-1.5 pt-1">
            {PRESENTATION_LIST.map((item) => {
              const checked = filters.presentations.includes(item)
              const count = counts.pMap[item] || 0
              return (
                <label
                  key={item}
                  className="flex items-center justify-between text-xs text-[#57534E] hover:text-[#1F1E1D] cursor-pointer py-0.5 group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePresentation(item)}
                      className="w-3.5 h-3.5 rounded border-[#D6CFC4] text-[#8A311F] focus:ring-[#8A311F] cursor-pointer"
                    />
                    <span className={checked ? 'font-bold text-[#1F1E1D]' : ''}>
                      {item}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A8A29E] font-mono group-hover:text-[#78716C]">
                    ({count})
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 5. Material Accordion */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => setOpenMaterial(!openMaterial)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1F1E1D] uppercase tracking-wider mb-2.5"
        >
          <span>Material</span>
          {openMaterial ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
          )}
        </button>

        {openMaterial && (
          <div className="space-y-1.5 pt-1">
            {MATERIAL_LIST.map((item) => {
              const checked = filters.materials.includes(item)
              const count = counts.mMap[item] || 0
              return (
                <label
                  key={item}
                  className="flex items-center justify-between text-xs text-[#57534E] hover:text-[#1F1E1D] cursor-pointer py-0.5 group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMaterial(item)}
                      className="w-3.5 h-3.5 rounded border-[#D6CFC4] text-[#8A311F] focus:ring-[#8A311F] cursor-pointer"
                    />
                    <span className={checked ? 'font-bold text-[#1F1E1D]' : ''}>
                      {item}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A8A29E] font-mono group-hover:text-[#78716C]">
                    ({count})
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile Drawer Action Button */}
      {isMobileDrawer && (
        <div className="pt-4 border-t border-[#E8E2D8]">
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="w-full py-3 rounded-xl bg-[#15232A] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            Ver {totalFilteredCount} productos
          </button>
        </div>
      )}
    </div>
  )
}
