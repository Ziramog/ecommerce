'use client'

import React, { useState } from 'react'
import type { StorefrontProduct } from '@/lib/catalog'
import { useCart } from '@/context/CartContext'
import { Plus, Minus, ShoppingCart, Check } from 'lucide-react'

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
      <div className="flex items-center space-x-3">
        {/* Quantity selector */}
        <div className="flex items-center border border-[#D9C9A8] rounded-[2px] bg-white">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2.5 text-pn-espresso/70 hover:text-pn-espresso transition-colors"
            aria-label="Disminuir cantidad"
          >
            <Minus size={14} />
          </button>
          <span className="w-9 text-center font-semibold text-xs font-sans">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-2.5 text-pn-espresso/70 hover:text-pn-espresso transition-colors"
            aria-label="Aumentar cantidad"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`flex-1 h-11 px-6 rounded-[2px] flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.18em] font-sans font-medium transition-all shadow-sm ${
            added
              ? 'bg-green-800 text-white'
              : 'bg-pn-marron hover:bg-pn-espresso text-white'
          }`}
        >
          {added ? (
            <>
              <Check size={15} />
              <span>¡Agregado al Carrito!</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              <span>Agregar al Carrito</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProductAddToCart
