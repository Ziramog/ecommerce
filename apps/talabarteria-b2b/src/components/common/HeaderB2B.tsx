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
      <div className="bg-[#18261E] text-[#D1DBD4] px-4 sm:px-6 lg:px-8 xl:px-12 py-1 sm:py-1.5 text-xs border-b border-[#23382C]">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-1.5 sm:gap-2">
          {/* Badges izquierda */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] sm:text-xs">
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
          <div className="flex items-center gap-4 text-[11px] sm:text-xs text-[#A2B5A7]">
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

      {/* 2. Main Navbar Oficial José Mercadal */}
      <div className="bg-[#FAF8F5] border-b border-[#E8E2D8] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full h-16 flex items-center justify-between gap-3 lg:gap-6">
          {/* A. Logo oficial José Mercadal con Isologo JM */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group py-1">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/brand/isologo-jm-transparent.png"
                alt="Isologo JM"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="relative h-5 sm:h-6 w-36 sm:w-44">
                <Image
                  src="/images/brand/logo-jose-mercadal-transparent.png"
                  alt="José Mercadal"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <span className="text-[7px] sm:text-[8px] tracking-[0.24em] text-[#78716C] font-semibold uppercase leading-tight mt-0.5">
                Talabartería & Artículos Ecuestres
              </span>
            </div>
          </Link>

          {/* B. Menú de Disciplinas Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-[11px] xl:text-xs font-bold tracking-wider text-[#292524]">
            {DISCIPLINES.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center gap-1 py-1 hover:text-[#8A311F] transition-colors"
              >
                <span>{item.name}</span>
                <ChevronDown className="w-3 h-3 text-[#A87B5B]" />
              </Link>
            ))}
          </nav>

          {/* C. Herramientas Derecha: Buscador, Ingresar, Pedido Rápido, Carrito */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Buscador con lupa a la izquierda */}
            <form
              onSubmit={handleSearch}
              className="relative hidden md:block"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8278]" />
              <input
                type="text"
                placeholder="Buscar productos, SKU o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-56 xl:w-64 2xl:w-80 bg-white/90 border border-[#D6CFC4] rounded-full pl-9 pr-4 py-2 text-xs text-[#1F1E1D] placeholder-[#9E958A] focus:outline-none focus:border-[#8A311F] focus:ring-1 focus:ring-[#8A311F] transition-all"
              />
            </form>

            {/* Acceso Comercial / Cuenta */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden xl:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#1F1E1D] truncate max-w-[130px]">
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#292524] hover:text-[#8A311F] hover:bg-[#EFEAE2] transition-colors"
              >
                <User className="w-4 h-4 text-[#292524]" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}

            {/* Botón Píldora Terracota: Pedido Rápido B2B */}
            <Link
              href="/pedido-rapido"
              title="Matriz de Pedido Rápido B2B"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8A311F] hover:bg-[#722718] text-white text-xs font-semibold shadow-sm transition-all flex-shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pedido Rápido</span>
            </Link>

            {/* Carrito de Compras con Ruedas y Notificación Roja */}
            <Link
              href="/pedido"
              className="relative p-2 text-[#292524] hover:text-[#8A311F] transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Ver pedido mayorista"
            >
              <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 bg-[#8A311F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalUnits}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-[#1F1E1D] hover:bg-[#EFEAE2]"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Disciplines Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E2D8] py-3 space-y-2">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8278]" />
              <input
                type="text"
                placeholder="Buscar productos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D6CFC4] rounded-lg pl-9 pr-4 py-2 text-xs text-[#1F1E1D]"
              />
            </form>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#1F1E1D]">
              {DISCIPLINES.map((d) => (
                <Link
                  key={d.name}
                  href={d.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded bg-white border border-[#E8E2D8] hover:bg-[#F4EFE8] flex items-center justify-between"
                >
                  <span>{d.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#A87B5B]" />
                </Link>
              ))}
            </div>
            <div className="pt-2 flex gap-2">
              <Link
                href="/pedido-rapido"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold bg-[#8A311F] text-white rounded-lg flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Pedido Rápido</span>
              </Link>
              <Link
                href="/cotizacion"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold border border-[#D6CFC4] text-[#1F1E1D] rounded-lg bg-white"
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
