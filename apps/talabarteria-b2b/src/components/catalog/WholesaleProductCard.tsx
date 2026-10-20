'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { B2BProduct } from '@/lib/catalog'
import { formatCurrencyARS, calculateVolumeDiscount } from '@/lib/utils'
import { useB2BCart } from '@/context/B2BCartContext'
import { ShoppingCart, Check, Layers } from 'lucide-react'

export function WholesaleProductCard({ product }: { product: B2BProduct }) {
  const { addItem } = useB2BCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
    product.wholesalePrice,
    qty,
    product.volumeTiers
  )

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white border border-b2b-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div>
        {/* Image & SKU bar */}
        <div className="relative h-48 bg-b2b-100 overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-b2b-400 text-xs">
              Sin fotografía técnica
            </div>
          )}
          <div className="absolute top-2 left-2 bg-navy/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
            {product.sku}
          </div>
          <div className="absolute top-2 right-2 bg-white/95 text-b2b-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-b2b-200">
            {product.packUnit}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-heading text-base font-bold text-navy mb-1.5 line-clamp-2">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-xs text-b2b-500 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Price Header */}
          <div className="bg-b2b-50 p-2.5 rounded border border-b2b-200 mb-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold text-b2b-600 uppercase tracking-wider">
                Precio Mayorista:
              </span>
              <span className="font-mono text-base font-bold text-navy">
                {formatCurrencyARS(unitPrice)}
                <span className="text-[10px] font-normal text-b2b-500 ml-1">/un</span>
              </span>
            </div>
            {discountPercent > 0 && (
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                Escala aplicada: -{discountPercent}% por volumen ({qty} un.)
              </span>
            )}
          </div>

          {/* Volume Tiers Table */}
          <div className="mb-4">
            <span className="text-[10px] uppercase font-bold text-b2b-500 tracking-wider flex items-center gap-1 mb-1.5">
              <Layers className="w-3 h-3 text-b2b-400" />
              Escalas de Descuento por Volumen:
            </span>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
              {product.volumeTiers.map((tier) => {
                const discounted = Math.round(
                  product.wholesalePrice * (1 - tier.discountPercent / 100)
                )
                const isActive = qty >= tier.minQty
                return (
                  <div
                    key={tier.minQty}
                    className={`p-1.5 rounded border ${
                      isActive
                        ? 'border-saddle bg-saddle/5 font-bold text-saddle-dark'
                        : 'border-b2b-200 bg-white text-b2b-600'
                    }`}
                  >
                    <div>{tier.label}</div>
                    <div className="text-[11px] font-semibold mt-0.5">
                      {formatCurrencyARS(discounted)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 border-t border-b2b-100 bg-b2b-50/50">
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center border border-b2b-300 rounded bg-white">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-2.5 py-1.5 text-b2b-600 hover:bg-b2b-100 text-xs font-bold"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center text-xs font-mono font-semibold focus:outline-none"
            />
            <button
              onClick={() => setQty(qty + 1)}
              className="px-2.5 py-1.5 text-b2b-600 hover:bg-b2b-100 text-xs font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex-1 py-2 px-3 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-navy hover:bg-navy-light text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Sumar {formatCurrencyARS(totalPrice)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
