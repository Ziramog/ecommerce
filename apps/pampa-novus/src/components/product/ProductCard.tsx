'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { StorefrontProduct } from '@/lib/catalog'
import { formatCurrencyARS, formatInstallments } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { ShoppingBag } from 'lucide-react'

interface ProductCardProps {
  product: StorefrontProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <div className="group flex flex-col bg-white border border-pampa-200/80 rounded overflow-hidden hover:shadow-luxury-hover transition-all duration-300">
      {/* Image container */}
      <Link
        href={`/productos/${product.handle}`}
        className="relative aspect-[4/5] bg-pampa-100 overflow-hidden block"
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-pampa-400 font-serif text-sm">
            Pampa Novus
          </div>
        )}

        {/* Floating badge */}
        <div className="absolute top-3 left-3 bg-pampa-950/80 backdrop-blur-sm text-pampa-100 text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-medium rounded-sm">
          Artesanía Criolla
        </div>
      </Link>

      {/* Info details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-pampa-500 uppercase block mb-1">
            {product.sku}
          </span>
          <Link
            href={`/productos/${product.handle}`}
            className="font-serif text-base font-semibold text-pampa-950 hover:text-leather transition-colors line-clamp-2 leading-snug mb-2"
          >
            {product.title}
          </Link>
          {product.description && (
            <p className="text-xs text-pampa-600 line-clamp-2 leading-relaxed mb-3">
              {product.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-pampa-100">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-serif text-lg font-bold text-pampa-950">
              {formatCurrencyARS(product.price)}
            </span>
          </div>
          <p className="text-[11px] text-pampa-600 font-sans">
            {formatInstallments(product.price, 3)}
          </p>

          <button
            type="button"
            onClick={() => addItem(product, 1)}
            className="mt-4 w-full py-2.5 px-4 bg-pampa-100 hover:bg-leather text-pampa-900 hover:text-white flex items-center justify-center space-x-2 text-xs uppercase tracking-widest font-semibold transition-all rounded-sm"
          >
            <ShoppingBag size={14} />
            <span>Agregar al Carrito</span>
          </button>
        </div>
      </div>
    </div>
  )
}
