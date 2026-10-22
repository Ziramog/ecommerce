'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { useB2BCart } from '@/context/B2BCartContext'
import {
  Building2,
  Lock,
  Truck,
  Search,
  User,
  ShoppingCart,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
  FileText,
} from 'lucide-react'

export const HEADER_CATEGORIES = [
  { name: 'POLO', href: '/catalogo?disciplina=polo' },
  { name: 'SALTO', href: '/catalogo?disciplina=salto' },
  { name: 'TURF', href: '/catalogo?disciplina=turf' },
  { name: 'MONTURAS', href: '/catalogo?categoria=Monturas' },
  { name: 'APEROS', href: '/catalogo?categoria=Aperos' },
  { name: 'ACCESORIOS', href: '/catalogo?categoria=Accesorios' },
  { name: 'CUIDADO DEL CUERO', href: '/catalogo?categoria=Cuidado+del+cuero' },
  { name: 'HERRAJES', href: '/catalogo?categoria=Herrajes' },
  { name: 'OTROS PRODUCTOS', href: '/catalogo?categoria=Otros+productos' },
]

export function HeaderB2B() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthB2B()
  const { totalUnits } = useB2BCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/catalogo')
    }
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm font-sans">
      {/* 1. Top Bar Superior (Canal mayorista, Cuentas aprobadas, Envíos) */}
      <div className="bg-[#18261E] text-[#D1DBD4] px-4 sm:px-6 lg:px-8 xl:px-12 py-1.5 text-xs border-b border-[#23382C]">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-1.5 sm:gap-2">
          {/* Badges izquierda */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium tracking-wide text-[#E4EDE6]">
              <Building2 className="w-3.5 h-3.5 text-[#9AB3A1]" />
              Canal mayorista exclusivo
            </span>
            <span className="text-[#3B5443] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 font-medium tracking-wide text-[#E4EDE6]">
              <Lock className="w-3.5 h-3.5 text-[#9AB3A1]" />
              Cuenta aprobada requerida
            </span>
            <span className="text-[#3B5443] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 font-medium tracking-wide text-[#E4EDE6]">
              <Truck className="w-3.5 h-3.5 text-[#9AB3A1]" />
              Envíos a todo el país
            </span>
          </div>

          {/* Enlaces derecha */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-[#A2B5A7]">
            <Link href="#historia" className="hover:text-white transition-colors">
              Sobre Mercadal
            </Link>
            <span className="text-[#3B5443]">|</span>
            <Link href="/catalogo" className="hover:text-white transition-colors">
              Novedades
            </Link>
            <span className="text-[#3B5443]">|</span>
            <Link href="/cotizacion" className="hover:text-white transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar Oficial José Mercadal: Logo + Centered Search + Actions */}
      <div className="bg-white border-b border-[#E5E5E5] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full h-16 sm:h-20 flex items-center justify-between gap-3 lg:gap-6">
          {/* A. Logo oficial José Mercadal con Isologo JM (Presencia y Escala Mejoradas) */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0 group py-1.5">
            <div className="relative h-7 w-[51px] sm:h-9 sm:w-[65px] lg:h-11 lg:w-[80px] flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/brand/isologo-jm-transparent.png"
                alt="Isologo JM"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="relative h-6 w-36 sm:h-7 sm:w-52 lg:h-8 lg:w-64">
                <Image
                  src="/images/brand/logo-jose-mercadal-transparent.png"
                  alt="José Mercadal"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <span className="text-[7px] sm:text-[8.5px] lg:text-[9.5px] tracking-[0.22em] text-[#78716C] font-semibold uppercase leading-tight mt-0.5 sm:mt-1">
                Talabartería & Artículos Ecuestres
              </span>
            </div>
          </Link>

          {/* B. Barra de Búsqueda Prominente Central (Marketplace Style - Botón Bordó Integrado) */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl mx-4 lg:mx-8 hidden lg:flex items-stretch"
          >
            <input
              type="text"
              placeholder="Buscar productos, SKU o categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D4D4D4] border-r-0 rounded-l px-3.5 py-2 text-xs text-[#202020] placeholder-[#8C8278] focus:outline-none focus:border-[#873427] transition-all"
            />
            <button
              type="submit"
              aria-label="Buscar en el catálogo"
              className="bg-[#873427] hover:bg-[#6D271D] text-white px-4 rounded-r flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>
          </form>

          {/* C. Herramientas Derecha: Ingresar, Pedido Rápido, Carrito */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Acceso Comercial / Cuenta */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden xl:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#202020] truncate max-w-[130px]">
                    {user?.companyName}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Mayorista Activo
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-1.5 sm:p-2 rounded text-[#737373] hover:text-[#202020] hover:bg-[#F5F5F5] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/acceso"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold text-[#202020] hover:text-[#873427] hover:bg-[#F5F5F5] transition-colors"
              >
                <User className="w-4 h-4 text-[#202020]" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}

            {/* Botón Pedido Rápido B2B (4px radius) */}
            <Link
              href="/pedido-rapido"
              title="Matriz de Pedido Rápido B2B"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded bg-[#873427] hover:bg-[#6D271D] text-white text-xs font-semibold transition-colors flex-shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedido Rápido</span>
            </Link>

            {/* Carrito de Compras */}
            <Link
              href="/pedido"
              className="relative p-1.5 sm:p-2 text-[#202020] hover:text-[#873427] transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Ver pedido mayorista"
            >
              <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 bg-[#873427] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                {totalUnits}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded text-[#1F1E1D] hover:bg-[#F5F5F5]"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Disciplines Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E5E5] py-3 space-y-2">
            <form onSubmit={handleSearch} className="flex items-stretch mb-3">
              <input
                type="text"
                placeholder="Buscar productos, SKU o categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D4D4D4] border-r-0 rounded-l px-3 py-2 text-xs text-[#202020]"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="bg-[#873427] text-white px-3.5 rounded-r flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#202020]">
              {HEADER_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded bg-white border border-[#E5E5E5] hover:bg-[#F5F5F5] flex items-center justify-between"
                >
                  <span className="text-[11px]">{cat.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#873427]" />
                </Link>
              ))}
            </div>
            <div className="pt-2 flex gap-2">
              <Link
                href="/pedido-rapido"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold bg-[#873427] text-white rounded flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Pedido Rápido</span>
              </Link>
              <Link
                href="/cotizacion"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold border border-[#D4D4D4] text-[#202020] rounded bg-white"
              >
                Cotización (RFQ)
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sub-Navbar de Categorías (9 rubros oficiales con chevron) */}
      <nav className="bg-white border-b border-[#E5E5E5] px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 hidden lg:block">
        <div className="w-full flex items-center justify-between gap-3 text-[11px] xl:text-xs font-bold tracking-wider text-[#202020]">
          {HEADER_CATEGORIES.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="inline-flex items-center gap-1 py-1 hover:text-[#873427] transition-colors whitespace-nowrap group"
            >
              <span>{item.name}</span>
              <ChevronDown className="w-3 h-3 text-[#873427] group-hover:translate-y-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
