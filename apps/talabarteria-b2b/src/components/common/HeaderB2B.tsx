'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { useB2BCart } from '@/context/B2BCartContext'
import {
  Building2,
  Lock,
  Truck,
  Search,
  User,
  ShoppingBag,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
  FileSpreadsheet,
} from 'lucide-react'

export function HorseSilhouette({ className = 'w-9 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 76 56"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M72.4 15.2c-1.8-3.6-5.2-6.5-9.1-8-2-.8-4.2-.6-5.9.6-3.2 2.3-6.9 3.8-10.8 4.3-3.6.5-7.2.2-10.7-.8l-4.5-1.3c-3.1-.9-6.4-.6-9.3.9-2.3 1.2-4.2 3.1-5.4 5.4l-3.2 6.1c-2.4 1.3-4.5 3.2-6 5.5-2.2 3.3-3.3 7.2-3.3 11.2 0 1.9.3 3.8.9 5.6l-3.8 8.9c-.8 1.9-.3 4 1.1 5.3 1.4 1.3 3.5 1.7 5.4.9l8.6-3.7c1.7-.7 2.9-2.2 3.4-4l2.4-7.5c2.3.9 4.7 1.3 7.2 1.3h7.2l-2 7.7c-.5 1.9.2 3.9 1.7 5.1 1.5 1.2 3.6 1.4 5.3.5l8.7-4.4c1.7-.9 2.8-2.6 3-4.5l1.1-9.9c2.4-1.9 4.3-4.4 5.5-7.2l4.1-9.6c1.1-2.6 1.4-5.5.8-8.3l-1.1-6.1c1.4-.7 2.7-1.6 3.7-2.8 1.5-1.6 2-3.8 1.2-5.8z" />
    </svg>
  )
}

const DISCIPLINES = [
  { name: 'POLO', href: '/catalogo?disciplina=polo' },
  { name: 'SALTO', href: '/catalogo?disciplina=salto' },
  { name: 'TURF', href: '/catalogo?disciplina=turf' },
  { name: 'MONTURAS', href: '/catalogo?disciplina=monturas' },
  { name: 'APEROS', href: '/catalogo?disciplina=aperos' },
  { name: 'ACCESORIOS', href: '/catalogo?disciplina=accesorios' },
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
    }
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm font-sans">
      {/* 1. Top Bar Superior (Canal mayorista, Cuentas aprobadas, Envíos) */}
      <div className="bg-[#18261e] text-[#d1dbd4] px-4 sm:px-6 lg:px-8 py-2 text-xs border-b border-[#23382c]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Badges izquierda */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium tracking-wide text-[#e4ede6]">
              <Building2 className="w-3.5 h-3.5 text-[#9ab3a1]" />
              Canal mayorista exclusivo
            </span>
            <span className="text-[#3b5443] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 font-medium tracking-wide text-[#e4ede6]">
              <Lock className="w-3.5 h-3.5 text-[#9ab3a1]" />
              Cuenta aprobada requerida
            </span>
            <span className="text-[#3b5443] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 font-medium tracking-wide text-[#e4ede6]">
              <Truck className="w-3.5 h-3.5 text-[#9ab3a1]" />
              Envíos a todo el país
            </span>
          </div>

          {/* Enlaces derecha */}
          <div className="flex items-center gap-4 text-[11px] sm:text-xs text-[#a2b5a7]">
            <Link href="#historia" className="hover:text-white transition-colors">
              Sobre Mercadal
            </Link>
            <span className="text-[#3b5443]">|</span>
            <Link href="/catalogo" className="hover:text-white transition-colors">
              Novedades
            </Link>
            <span className="text-[#3b5443]">|</span>
            <Link href="/cotizacion" className="hover:text-white transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar (Logo ecuestre, Menú disciplinas, Buscador, Acceso, Carrito) */}
      <div className="bg-[#FAF8F5] border-b border-[#E8E2D8] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between gap-4">
          {/* Logo con silueta de caballo y tradición */}
          <Link href="/" className="flex items-center gap-3.5 flex-shrink-0 group">
            <div className="text-[#1F1E1D] group-hover:text-[#6B3A2A] transition-colors">
              <HorseSilhouette className="w-10 h-8 sm:w-12 sm:h-9" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.08em] text-[#1F1E1D] uppercase leading-tight">
                Talabartería Mercadal
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-[#78716C] font-semibold uppercase leading-tight mt-0.5">
                Tradición que acompaña nuevos caminos.
              </span>
            </div>
          </Link>

          {/* Menú de Disciplinas Desktop */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold tracking-wider text-[#1F1E1D]">
            {DISCIPLINES.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center gap-1 py-1 hover:text-[#6B3A2A] transition-colors"
              >
                <span>{item.name}</span>
                <ChevronDown className="w-3 h-3 text-[#A8A29E]" />
              </Link>
            ))}
          </nav>

          {/* Buscador + Acceso + Carrito */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-xl">
            {/* Buscador */}
            <form
              onSubmit={handleSearch}
              className="relative hidden md:block flex-1 max-w-xs"
            >
              <input
                type="text"
                placeholder="Buscar productos, códigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D6CFC4] rounded-full pl-4 pr-9 py-2 text-xs text-[#1F1E1D] placeholder-[#A8A29E] focus:outline-none focus:border-[#1C3B2B] focus:ring-1 focus:ring-[#1C3B2B] transition-all"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1F1E1D]"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Acceso Comercial / Cuenta */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#1F1E1D] truncate max-w-[140px]">
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
                  className="p-2 rounded-full text-[#78716C] hover:text-[#1F1E1D] hover:bg-[#EFEAE2] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/acceso"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1F1E1D] hover:text-[#6B3A2A] hover:bg-[#EFEAE2] transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}

            {/* Matriz Pedido Rápido (Acceso directo profesional) */}
            <Link
              href="/pedido-rapido"
              title="Matriz de Pedido Rápido B2B"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C3B2B]/10 hover:bg-[#1C3B2B]/20 text-[#1C3B2B] text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Pedido Rápido</span>
            </Link>

            {/* Carrito de Pedido */}
            <Link
              href="/pedido"
              className="relative p-2 rounded-full text-[#1F1E1D] hover:bg-[#EFEAE2] transition-colors flex items-center justify-center"
              aria-label="Ver pedido mayorista"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#1C3B2B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalUnits}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded text-[#1F1E1D] hover:bg-[#EFEAE2]"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Disciplines Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#E8E2D8] py-3 space-y-2">
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar productos, códigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D6CFC4] rounded-lg pl-4 pr-9 py-2 text-xs text-[#1F1E1D]"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C]"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#1F1E1D]">
              {DISCIPLINES.map((d) => (
                <Link
                  key={d.name}
                  href={d.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded bg-white border border-[#E8E2D8] hover:bg-[#F4EFE8]"
                >
                  {d.name}
                </Link>
              ))}
            </div>
            <div className="pt-2 flex gap-2">
              <Link
                href="/pedido-rapido"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold bg-[#1C3B2B] text-white rounded"
              >
                Matriz Pedido Rápido
              </Link>
              <Link
                href="/cotizacion"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold border border-[#D6CFC4] text-[#1F1E1D] rounded bg-white"
              >
                Cotización (RFQ)
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
