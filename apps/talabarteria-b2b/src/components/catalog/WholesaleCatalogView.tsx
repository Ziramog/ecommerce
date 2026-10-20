'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { B2BProduct } from '@/lib/catalog'
import { WholesaleProductCard } from './WholesaleProductCard'
import {
  Home,
  ChevronRight,
  Layers,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  X,
} from 'lucide-react'

interface WholesaleCatalogViewProps {
  products: B2BProduct[]
}

export function WholesaleCatalogView({ products }: WholesaleCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<string>('relevantes')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedCategory !== 'todos') {
      result = result.filter(
        (p) =>
          p.handle.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          p.title.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    if (sortBy === 'menor-precio') {
      result.sort((a, b) => a.wholesalePrice - b.wholesalePrice)
    } else if (sortBy === 'mayor-precio') {
      result.sort((a, b) => b.wholesalePrice - a.wholesalePrice)
    } else if (sortBy === 'sku') {
      result.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''))
    }

    return result
  }, [products, selectedCategory, sortBy])

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-6 sm:py-8 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#78716C] mb-6 font-medium">
          <Link href="/" className="hover:text-[#1F1E1D] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
          <Link href="/catalogo" className="hover:text-[#1F1E1D]">
            Catálogo Comercial
          </Link>
          <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
          <span className="text-[#1F1E1D] font-semibold">Lista de Precios Mayorista</span>
        </nav>

        {/* 2. Hero Banner de Lista de Precios */}
        <div className="relative bg-white border border-[#E8E2D8] rounded-2xl p-6 sm:p-8 lg:p-10 mb-8 overflow-hidden shadow-xs">
          {/* Fondo Faded Ecuestre a la derecha */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
            <Image
              src="/images/home/hero-polo-action.jpg"
              alt="Talabartería Mayorista"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#8A311F] font-bold block mb-2">
                Catálogo Comercial
              </span>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-3xl font-bold text-[#1F1E1D] uppercase tracking-tight mb-2">
                LISTA DE PRECIOS MAYORISTA
              </h1>

              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                Precios netos en pesos argentinos (ARS).
              </p>
            </div>

            {/* Bloque Derecho: Tradición que equipa tu negocio + Botón Matriz */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-4 lg:gap-6 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-3 text-right">
                <div className="w-[1.5px] h-10 bg-[#D6CFC4]" />
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#78716C] font-serif leading-tight">
                  <span className="block font-bold text-[#8A311F]">Tradición</span>
                  <span className="block">Que Equipa</span>
                  <span className="block font-semibold">Tu Negocio</span>
                </div>
              </div>

              <Link
                href="/pedido-rapido"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#15232A] hover:bg-[#1E333F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm group"
              >
                <Layers className="w-4 h-4 text-[#C86D51] group-hover:scale-110 transition-transform" />
                <span>MODO CARGA MASIVA (MATRIZ)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Barra de Control: Resultados, Filtrar, Ordenar y Vista */}
        <div className="bg-white border border-[#E8E2D8] rounded-xl p-3.5 sm:p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          {/* Total Resultados */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-[#1F1E1D]">
              {filteredProducts.length} productos
            </span>
            <span className="text-[#A8A29E]">|</span>
            <span className="text-[#57534E]">
              Mostrando 1–{filteredProducts.length} de {products.length} resultados
            </span>
          </div>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            {/* Botón Filtrar */}
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D6CFC4] hover:bg-[#FAF8F5] text-xs font-semibold text-[#1F1E1D] transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Filtrar</span>
              {selectedCategory !== 'todos' && (
                <span className="w-2 h-2 rounded-full bg-[#8A311F]" />
              )}
            </button>

            {/* Selector Ordenar por */}
            <div className="flex items-center gap-2 text-xs text-[#57534E]">
              <span className="hidden sm:inline font-medium">Ordenar por:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#D6CFC4] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[#1F1E1D] focus:outline-none focus:border-[#8A311F] cursor-pointer"
                >
                  <option value="relevantes">Más relevantes</option>
                  <option value="menor-precio">Menor precio</option>
                  <option value="mayor-precio">Mayor precio</option>
                  <option value="sku">Código SKU</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Selector de Modo Vista (Grid vs List) */}
            <div className="flex items-center border border-[#D6CFC4] rounded-lg overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#C86D51] text-white'
                    : 'text-[#78716C] hover:bg-[#FAF8F5]'
                }`}
                aria-label="Vista cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#C86D51] text-white'
                    : 'text-[#78716C] hover:bg-[#FAF8F5]'
                }`}
                aria-label="Vista lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer / Barra de Filtros Rápida si está abierto */}
        {filterDrawerOpen && (
          <div className="bg-[#FAF6F0] border border-[#E8E2D8] rounded-xl p-4 mb-8 flex flex-wrap items-center gap-2 animate-fadeIn">
            <span className="text-xs font-bold text-[#1F1E1D] mr-2">Filtrar por rubro:</span>
            {[
              { id: 'todos', label: 'Todos los productos' },
              { id: 'montura', label: 'Monturas & Bastos' },
              { id: 'lonja', label: 'Lonjas & Cueros' },
              { id: 'bozal', label: 'Bozales & Cabezadas' },
              { id: 'freno', label: 'Frenos & Riendas' },
              { id: 'estribos', label: 'Estribos' },
              { id: 'cuchillo', label: 'Cuchillería' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#8A311F] text-white shadow-xs'
                    : 'bg-white border border-[#D6CFC4] text-[#57534E] hover:bg-[#FAF8F5]'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {selectedCategory !== 'todos' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className="text-xs text-[#8A311F] hover:underline ml-2 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar filtro</span>
              </button>
            )}
          </div>
        )}

        {/* 4. Grilla de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E8E2D8] rounded-2xl">
            <p className="text-sm text-[#57534E] mb-3">
              No se encontraron productos para el filtro seleccionado.
            </p>
            <button
              onClick={() => setSelectedCategory('todos')}
              className="text-xs font-bold text-[#8A311F] hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProducts.map((product) => (
              <WholesaleProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
