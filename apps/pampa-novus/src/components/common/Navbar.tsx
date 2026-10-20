'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, Search, Menu, X, ShieldCheck } from 'lucide-react'

export function Navbar() {
  const { totalItems, openCart } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Catálogo Completo', href: '/catalogo' },
    { name: 'Monturas & Aperos', href: '/catalogo?categoria=aperos' },
    { name: 'Cinturones & Marroquinería', href: '/catalogo?categoria=marroquineria' },
    { name: 'Herrajes & Platería', href: '/catalogo?categoria=plateria' },
    { name: 'Cuidado del Cuero', href: '/catalogo?categoria=cuidado' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-pampa-50/95 backdrop-blur-md border-b border-pampa-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-pampa-900 hover:text-pampa-600 p-2"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <span className="block font-serif text-2xl sm:text-3xl font-bold tracking-[0.25em] text-pampa-950 uppercase group-hover:text-leather transition-colors">
                PAMPA NOVUS
              </span>
              <span className="block text-[9px] sm:text-[10px] tracking-[0.35em] text-pampa-600 uppercase font-sans font-medium mt-0.5">
                Talabartería & Marroquinería Criolla
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-[0.18em] font-medium text-pampa-800 hover:text-leather transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-leather hover:after:w-full after:transition-all"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5">
            <Link
              href="/catalogo"
              className="text-pampa-800 hover:text-leather p-2 transition-colors hidden sm:inline-flex"
              aria-label="Buscar productos"
            >
              <Search size={20} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-pampa-950 hover:text-leather transition-colors flex items-center"
              aria-label="Ver carrito"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-leather text-white font-sans text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-pampa-200 bg-pampa-50 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-[0.15em] font-medium text-pampa-900 hover:text-leather py-2"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-pampa-200 text-xs text-pampa-600 flex items-center gap-2">
            <ShieldCheck size={16} className="text-leather" />
            <span>Tienda Minorista Oficial de Mercadal</span>
          </div>
        </div>
      )}
    </header>
  )
}
