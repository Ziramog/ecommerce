'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { PampaNovusLogo } from '@/components/brand/PampaNovusLogo'
import { ShoppingBag, Search, User, Heart, Menu, X } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { totalItems, openCart } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navLinks = [
    { name: 'PRODUCTOS', href: '/catalogo' },
    { name: 'CATEGORÍAS', href: '/#categorias' },
    { name: 'NUESTRA HISTORIA', href: '/#nuestra-historia' },
    { name: 'TALABARTERÍA MERCADAL', href: 'http://localhost:3001', badge: 'B2B' },
    { name: 'CONTACTO', href: '/#contacto' },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2] border-b border-[#EFE8DE] transition-all">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-[72px]">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-pn-espresso hover:text-pn-cognac p-2 transition-colors -ml-2"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Brand Logo: Official Horizontal Master Asset */}
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-90">
              <PampaNovusLogo variant="horizontal" height={32} priority />
            </Link>
          </div>

          {/* Desktop Navigation Links — Jerarquía y legibilidad mejoradas */}
          <nav className="hidden lg:flex items-center space-x-7 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] uppercase tracking-[0.14em] font-sans font-medium text-pn-espresso hover:text-pn-cognac transition-colors relative py-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-pn-cognac hover:after:w-full after:transition-all"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="ml-1.5 text-[9.5px] bg-pn-crema text-pn-marron px-1.5 py-0.5 rounded-[2px] border border-pn-arena/60 font-semibold tracking-normal">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Action Controls: Search, Account, Wishlist, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Pill Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-56 pl-8 pr-3 py-1.5 text-[13px] bg-[#F5EBDD]/40 hover:bg-[#F5EBDD]/70 focus:bg-white text-pn-espresso placeholder-pn-cognac/60 border border-[#D9C9A8]/70 focus:border-pn-cognac rounded-[3px] outline-none transition-all font-sans"
              />
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-pn-cognac pointer-events-none"
              />
            </form>

            {/* Mobile Search Link */}
            <Link
              href="/catalogo"
              className="md:hidden text-pn-espresso hover:text-pn-cognac p-1.5 transition-colors"
              aria-label="Buscar productos"
            >
              <Search size={19} />
            </Link>

            {/* User Account Outline */}
            <button
              type="button"
              className="text-pn-espresso hover:text-pn-cognac p-1.5 transition-colors"
              aria-label="Mi Cuenta"
              title="Mi Cuenta"
            >
              <User size={19} strokeWidth={1.6} />
            </button>

            {/* Wishlist Heart Outline */}
            <button
              type="button"
              className="text-pn-espresso hover:text-pn-cognac p-1.5 transition-colors"
              aria-label="Favoritos"
              title="Favoritos"
            >
              <Heart size={19} strokeWidth={1.6} />
            </button>

            {/* Shopping Cart with Circular Badge */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 text-pn-espresso hover:text-pn-cognac transition-colors flex items-center"
              aria-label="Ver carrito"
              title="Carrito de compras"
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
              <span className="absolute -top-1 -right-1 bg-pn-marron text-white font-sans text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EFE8DE] bg-[#FAF7F2] px-6 py-5 space-y-3.5 shadow-lg animate-in fade-in duration-200">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#F5EBDD]/60 text-pn-espresso placeholder-pn-cognac/70 border border-[#D9C9A8] rounded-[2px] outline-none font-sans"
            />
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-pn-cognac pointer-events-none"
            />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs uppercase tracking-[0.16em] font-sans font-medium text-pn-espresso hover:text-pn-cognac py-2 border-b border-[#EFE8DE]/60"
            >
              {link.name}
              {link.badge && (
                <span className="ml-2 text-[9px] bg-pn-crema text-pn-marron px-1.5 py-0.5 rounded-[2px] border border-pn-arena/60 font-semibold">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="pt-2 text-[11px] text-pn-cognac font-sans flex items-center justify-between">
            <span>Canal minorista oficial</span>
            <span className="font-semibold text-pn-marron">PAMPA NOVUS</span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
