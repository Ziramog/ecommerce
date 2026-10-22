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
      {/* 1. Marco Fotográfico con fondo marfil uniforme */}
      <div className={`relative ${aspectRatioClass} bg-[#F8F5EE] overflow-hidden`}>
        {/* Badge discreto */}
        {displayBadge && (
          <div className="absolute top-2 left-2 z-10 bg-pn-marron text-white text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 font-sans font-medium rounded-[1px] shadow-sm select-none">
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
          <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={1.75} />
        </button>

        {/* Fotografía protagonista íntegra con object-contain */}
        <Link
          href={`/productos/${product.handle}`}
          className="w-full h-full block relative"
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-2.5 sm:p-3 group-hover:scale-104 transition-transform duration-500 ease-out"
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
          {/* Nombre con 2 líneas reservadas */}
          <Link
            href={`/productos/${product.handle}`}
            className="font-sans text-[12px] sm:text-[13px] font-medium text-pn-espresso hover:text-pn-cognac transition-colors line-clamp-2 leading-snug min-h-[2.2rem] block mb-1.5"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Precio ARS destacado */}
          <div className="mb-2.5">
            <span className="font-sans text-[13px] sm:text-[15px] font-bold text-pn-espresso tracking-tight">
              {formatCurrencyARS(product.price)}
            </span>
          </div>
        </div>

        {/* 3. Botón de Compra Rectangular Limpio */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full h-8 sm:h-[34px] px-2 bg-pn-marron hover:bg-pn-espresso text-white flex items-center justify-center space-x-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] font-sans font-medium transition-colors rounded-[2px] shadow-sm"
        >
          <ShoppingCart size={13} className={isAdding ? 'animate-bounce' : ''} />
          <span>{isAdding ? 'Agregado' : 'Agregar al carrito'}</span>
        </button>
      </div>
    </div>
  )
}

// Named alias export for direct requirement referencing
export const ProductCardPremium = ProductCard

export default ProductCard
