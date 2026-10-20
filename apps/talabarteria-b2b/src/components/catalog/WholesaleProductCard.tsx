'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { B2BProduct } from '@/lib/catalog'
import { formatCurrencyARS, calculateVolumeDiscount, DEFAULT_VOLUME_TIERS } from '@/lib/utils'
import { useB2BCart } from '@/context/B2BCartContext'
import { ShoppingCart, Check, Tag, Package, Heart, Percent } from 'lucide-react'

export function WholesaleProductCard({ product }: { product: B2BProduct }) {
  const { addItem } = useB2BCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [favorited, setFavorited] = useState(false)

  const activeTiers =
    product.volumeTiers && product.volumeTiers.length > 0
      ? product.volumeTiers
      : DEFAULT_VOLUME_TIERS

  const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
    product.wholesalePrice,
    qty,
    activeTiers
  )

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // Calculate best discount tier price (usually 10+ un. / -20%)
  const bestTier = activeTiers[activeTiers.length - 1]
  const bestUnitPrice = Math.round(
    product.wholesalePrice * (1 - (bestTier?.discountPercent || 20) / 100)
  )

  return (
    <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Imagen y Badges Superiores */}
        <div className="relative h-56 bg-[#FAF6F0] overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[#A8A29E] text-xs">
              Sin fotografía técnica
            </div>
          )}

          {/* SKU Pill (Arriba Izquierda) */}
          <div className="absolute top-3 left-3 bg-[#18261E] text-white text-[11px] font-mono px-2.5 py-1 rounded-md font-bold shadow-xs">
            {product.sku || 'SKU-001'}
          </div>

          {/* Unidad / Pack y Favorito (Arriba Derecha) */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="bg-white/95 text-[#292524] text-[11px] font-semibold px-2.5 py-1 rounded-md border border-[#E8E2D8] flex items-center gap-1.5 shadow-xs">
              <Package className="w-3.5 h-3.5 text-[#8A311F]" />
              <span>{product.packUnit || 'Unidad'}</span>
            </div>

            <button
              type="button"
              onClick={() => setFavorited(!favorited)}
              className="w-7 h-7 rounded-full bg-white/95 border border-[#E8E2D8] flex items-center justify-center text-[#78716C] hover:text-[#8A311F] transition-colors shadow-xs"
              aria-label="Agregar a favoritos"
            >
              <Heart
                className={`w-3.5 h-3.5 ${favorited ? 'fill-[#8A311F] text-[#8A311F]' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Título y Descripción */}
        <div className="p-5">
          <h3 className="font-serif text-lg font-bold text-[#1F1E1D] mb-1.5 leading-snug line-clamp-2 group-hover:text-[#8A311F] transition-colors">
            {product.title}
          </h3>

          <p className="text-xs text-[#57534E] line-clamp-2 mb-4 leading-relaxed font-normal">
            {product.description ||
              'Pieza artesanal confeccionada en materiales nobles con especificaciones profesionales para uso ecuestre y de campo.'}
          </p>

          {/* Caja Destacada de Precio Mayorista */}
          <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E8E2D8] mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#8A311F] flex-shrink-0">
                <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block leading-tight">
                  Precio Mayorista
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-serif text-2xl font-bold text-[#1F1E1D] leading-none">
                    {formatCurrencyARS(unitPrice)}
                  </span>
                  <span className="text-[11px] font-medium text-[#78716C]">/un</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-right flex-shrink-0">
              <Tag className="w-4 h-4 text-[#8A311F]" />
              <div className="text-[11px] text-[#57534E] leading-tight">
                <span className="block font-medium">Mejor precio</span>
                <span className="font-bold text-[#1F1E1D]">desde {bestTier?.minQty || 10} un.</span>
              </div>
            </div>
          </div>

          {/* Escalas de Descuento por Volumen */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#44403C] tracking-wider mb-2">
              <Percent className="w-3 h-3 text-[#8A311F]" />
              <span>Escalas de descuento por volumen:</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {activeTiers.map((tier) => {
                const discounted = Math.round(
                  product.wholesalePrice * (1 - tier.discountPercent / 100)
                )
                const isActive =
                  qty >= tier.minQty &&
                  (tier === activeTiers[activeTiers.length - 1] ||
                    qty < (activeTiers[activeTiers.indexOf(tier) + 1]?.minQty || Infinity))

                return (
                  <button
                    key={tier.minQty}
                    type="button"
                    onClick={() => setQty(tier.minQty)}
                    className={`p-2 rounded-xl border transition-all text-left flex flex-col justify-between ${
                      isActive
                        ? 'border-[#D48D70] bg-[#FFF8F0] shadow-xs'
                        : 'border-[#E8E2D8] bg-white hover:border-[#D6CFC4] text-[#57534E]'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] leading-tight mb-1">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8A311F] flex-shrink-0" />
                      )}
                      <span className={isActive ? 'font-bold text-[#8A311F]' : 'font-medium'}>
                        {tier.label}
                      </span>
                    </div>
                    <div className="font-bold text-xs font-mono text-[#1F1E1D]">
                      {formatCurrencyARS(discounted)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer de Acción: Selector de Cantidad + Sumar al Pedido */}
      <div className="p-5 pt-0">
        <div className="flex items-center gap-2.5">
          {/* Selector de cantidad */}
          <div className="flex items-center border border-[#D6CFC4] rounded-xl bg-white h-11 flex-shrink-0">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 h-full text-[#57534E] hover:bg-[#FAF8F5] text-base font-bold transition-colors rounded-l-xl"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-10 text-center text-sm font-mono font-bold text-[#1F1E1D] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="px-3 h-full text-[#57534E] hover:bg-[#FAF8F5] text-base font-bold transition-colors rounded-r-xl"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          {/* Botón Sumar al Pedido */}
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 h-11 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#15232A] hover:bg-[#1E333F] text-white active:scale-[0.98]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Agregado al Pedido!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 stroke-[2]" />
                <span>Sumar {formatCurrencyARS(totalPrice)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
