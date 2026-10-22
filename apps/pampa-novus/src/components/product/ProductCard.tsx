'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { StorefrontProduct } from '@/lib/catalog'
import { formatCurrencyARS } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { ShoppingCart, Heart } from 'lucide-react'

export interface ProductCardProps {
  product: StorefrontProduct
  badge?: 'DESTACADO' | 'NUEVO' | string
  aspectRatioClass?: string
}

/**
 * ProductCardPremium
 * Reusable premium product card for Home and Catalog grids.
 * Strictly adheres to 02_home_referencias/04_productos_destacados_layout.png
 */
export function ProductCard({
  product,
  badge,
  aspectRatioClass = 'aspect-[4/3]',
}: ProductCardProps) {
  const { addItem } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Discretely resolve badge only when warranted
  const displayBadge =
    badge ||
    (product.sku?.includes('CRI-001')
      ? 'DESTACADO'
      : product.sku?.includes('DUAL-002')
      ? 'NUEVO'
      : null)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(product, 1)
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <div className="group flex flex-col bg-white border border-[#EFE8DE] rounded-[2px] overflow-hidden hover:shadow-subtle transition-all duration-200">
      {/* 1. Marco Fotográfico con fondo marfil uniforme — Dimensiones y padding optimizados */}
      <div className={`relative ${aspectRatioClass} bg-[#F8F5EE] overflow-hidden`}>
        {/* Badge discreto */}
        {displayBadge && (
          <div className="absolute top-2 left-2 z-10 bg-pn-marron text-white text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 font-sans font-medium rounded-[1px] shadow-sm select-none">
            {displayBadge}
          </div>
        )}

        {/* Botón Favorito discreto arriba a la derecha */}
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors ${
            isWishlisted
              ? 'text-pn-terracota bg-white shadow-sm'
              : 'text-pn-espresso/45 hover:text-pn-espresso hover:bg-white/70'
          }`}
          aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          title={isWishlisted ? 'En favoritos' : 'Guardar en favoritos'}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={1.75} />
        </button>

        {/* Fotografía protagonista íntegra con object-contain y padding optimizado para presencia destacada */}
        <Link
          href={`/productos/${product.handle}`}
          className="w-full h-full block relative"
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-pn-arena font-serif text-xs">
              Pampa Novus
            </div>
          )}
        </Link>
      </div>

      {/* 2. Información Comercial: Nombre, Precio y Acción */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between bg-white border-t border-[#EFE8DE]/60">
        <div>
          {/* Nombre con 2 líneas reservadas y mayor legibilidad */}
          <Link
            href={`/productos/${product.handle}`}
            className="font-sans text-[13px] sm:text-sm font-medium text-pn-espresso hover:text-pn-cognac transition-colors line-clamp-2 leading-snug min-h-[2.5rem] block mb-2"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Precio ARS destacado con jerarquía visual robusta */}
          <div className="mb-3">
            <span className="font-sans text-sm sm:text-base font-bold text-pn-espresso tracking-tight">
              {formatCurrencyARS(product.price)}
            </span>
          </div>
        </div>

        {/* 3. Botón de Compra Rectangular Limpio y Consistente */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full h-9 sm:h-[36px] px-2.5 bg-pn-marron hover:bg-pn-espresso text-white flex items-center justify-center space-x-2 text-[11px] sm:text-xs uppercase tracking-[0.12em] font-sans font-medium transition-colors rounded-[2px] shadow-sm"
        >
          <ShoppingCart size={14} className={isAdding ? 'animate-bounce' : ''} />
          <span>{isAdding ? 'Agregado' : 'Agregar al carrito'}</span>
        </button>
      </div>
    </div>
  )
}

// Named alias export for direct requirement referencing
export const ProductCardPremium = ProductCard

export default ProductCard
