'use client'

import React from 'react'
import Link from 'next/link'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { useB2BCart } from '@/context/B2BCartContext'
import { Building2, ShoppingBag, FileText, User, LogOut, ShieldCheck, Clock } from 'lucide-react'

export function HeaderB2B() {
  const { user, isAuthenticated, logout } = useAuthB2B()
  const { totalUnits } = useB2BCart()

  return (
    <header className="sticky top-0 z-40 bg-navy text-white border-b border-navy-light shadow-md">
      {/* Top Banner */}
      <div className="bg-navy-dark px-4 py-1.5 text-xs text-b2b-300 flex justify-between items-center border-b border-navy-light/40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Portal Exclusivo para Clientes Comerciales y Distribuidores</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-b2b-400">
          <span>CUIT Emisor: 30-58291472-4</span>
          <span>•</span>
          <span>Mesa Comercial: (011) 4892-1200</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex flex-col">
          <span className="font-heading text-xl sm:text-2xl tracking-wider text-white font-bold uppercase">
            Talabartería Mercadal
          </span>
          <span className="text-[10px] tracking-widest text-b2b-400 uppercase font-sans">
            División Mayorista & Granel B2B
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/catalogo"
            className="text-b2b-200 hover:text-white transition-colors"
          >
            Catálogo Mayorista
          </Link>
          <Link
            href="/pedido-rapido"
            className="text-b2b-200 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="inline-block px-1.5 py-0.5 bg-saddle text-[10px] uppercase font-bold rounded text-white">
              B2B
            </span>
            Pedido Rápido (Matriz)
          </Link>
          <Link
            href="/cotizacion"
            className="text-b2b-200 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-b2b-400" />
            Cotizaciones (RFQ)
          </Link>
        </nav>

        {/* Session / User Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                  {user?.companyName}
                </span>
                <span className="text-[10px] text-b2b-400 flex items-center justify-end gap-1">
                  {user?.status === 'approved' ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Mayorista Activo</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 font-medium">Revisión CUIT</span>
                    </>
                  )}
                </span>
              </div>

              <Link
                href="/pedido"
                className="relative p-2 rounded bg-navy-light hover:bg-navy-light/80 text-white transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <ShoppingBag className="w-4 h-4 text-saddle-light" />
                <span className="hidden sm:inline">Pedido</span>
                {totalUnits > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-saddle text-white rounded-full text-[11px] font-bold">
                    {totalUnits}
                  </span>
                )}
              </Link>

              <button
                onClick={logout}
                title="Cerrar sesión comercial"
                className="p-2 rounded text-b2b-400 hover:text-white hover:bg-navy-light transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/acceso"
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider bg-saddle hover:bg-saddle-dark text-white transition-colors shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                Acceso Mayorista
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
