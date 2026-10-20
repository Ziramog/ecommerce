'use client'

import React, { useState } from 'react'
import type { StorefrontProduct } from '@/lib/catalog'
import { useCart } from '@/context/CartContext'
import { Plus, Minus, ShoppingBag, Check } from 'lucide-react'

interface ProductAddToCartProps {
  product: StorefrontProduct
}

export function ProductAddToCart({ product }: ProductAddToCartProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Quantity selector */}
        <div className="flex items-center border border-pampa-300 rounded bg-white">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 text-pampa-600 hover:text-pampa-950 transition-colors"
            aria-label="Disminuir cantidad"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 text-pampa-600 hover:text-pampa-950 transition-colors"
            aria-label="Aumentar cantidad"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`flex-1 py-3.5 px-6 rounded flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-md ${
            added
              ? 'bg-green-800 text-white'
              : 'bg-leather hover:bg-leather-dark text-white'
          }`}
        >
          {added ? (
            <>
              <Check size={16} />
              <span>¡Agregado al Carrito!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              <span>Agregar al Carrito</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
