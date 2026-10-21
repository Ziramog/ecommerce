'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { B2BProduct } from '@/lib/catalog'
import { formatCurrencyARS, calculateVolumeDiscount, DEFAULT_VOLUME_TIERS } from '@/lib/utils'
import { useB2BCart } from '@/context/B2BCartContext'
import { ShoppingCart, Check, Heart } from 'lucide-react'

export interface ProductCardB2BProps {
  product: B2BProduct
}

export function ProductCardB2B({ product }: ProductCardB2BProps) {
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
    setTimeout(() => setAdded(false), 1800)
  }

  const isPack =
    product.packUnit?.toLowerCase().includes('pack') ||
    product.handle.toLowerCase().includes('pack')

  return (
    <div className="bg-white border border-[#E8E2D8] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* A. Fotografía 1:1 con object-contain limpio y badges oficiales */}
        <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden">
          <Link
            href={`/productos/${product.handle}`}
            className="block w-full h-full relative cursor-pointer group/img"
          >
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-contain p-3.5 sm:p-4 group-hover/img:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-[#A8A29E] text-xs">
                Sin fotografía técnica
              </div>
            )}
          </Link>

          {/* Badge Superior Izquierdo: SKU oscuro discreto */}
          <div className="absolute top-2.5 left-2.5 bg-[#18261E] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs pointer-events-none">
            {product.sku || 'SKU-001'}
          </div>

          {/* Badge Superior Derecho: Favorito */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setFavorited(!favorited)
            }}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/95 border border-[#E8E2D8] flex items-center justify-center text-[#78716C] hover:text-[#8A311F] transition-colors shadow-2xs z-10"
            aria-label="Agregar a favoritos"
          >
            <Heart
              className={`w-3.5 h-3.5 ${favorited ? 'fill-[#8A311F] text-[#8A311F]' : ''}`}
            />
          </button>

          {/* Badge Inferior Izquierdo: Estado de Stock */}
          <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
            {isPack ? (
              <span className="bg-white/95 text-[#8A311F] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#E8E2D8] flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A311F]" />
                Pack cerrado
              </span>
            ) : (
              <span className="bg-white/95 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                En stock
              </span>
            )}
          </div>

          {/* Badge Inferior Derecho: Tipo de Presentación */}
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
            <span className="bg-white/95 text-[#292524] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#E8E2D8] shadow-2xs">
              {product.packUnit || 'Unidad'}
            </span>
          </div>
        </div>

        {/* B. Información Comercial */}
        <div className="p-3.5 sm:p-4 pb-2">
          {/* Título: Máximo 2 líneas */}
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#1F1E1D] leading-snug line-clamp-2 hover:text-[#8A311F] transition-colors mb-1 min-h-[2.5rem]">
            <Link href={`/productos/${product.handle}`}>
              {product.title}
            </Link>
          </h3>

          {/* Descripción corta: 2 líneas */}
          <p className="text-[11px] text-[#57534E] line-clamp-2 leading-relaxed font-normal mb-2.5 min-h-[2rem]">
            {product.description ||
              'Pieza artesanal confeccionada en materiales nobles con especificaciones profesionales para uso ecuestre y de campo.'}
          </p>

          {/* Precio Mayorista con Jerarquía Visual Alta */}
          <div className="flex items-baseline gap-1 mb-2.5">
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#1F1E1D] leading-none">
              {formatCurrencyARS(unitPrice)}
            </span>
            <span className="text-xs text-[#78716C] font-normal">
              /{isPack ? 'pack' : 'un'}
            </span>
          </div>

          {/* C. Escalas de Descuento por Volumen (3 cajitas compactas) */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
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
                  className={`p-1.5 rounded-lg border text-center flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-[#D48D70] bg-[#FFF8F0] shadow-2xs ring-1 ring-[#D48D70]'
                      : 'border-[#E8E2D8] bg-[#FAF8F5] hover:border-[#D6CFC4] text-[#57534E]'
                  }`}
                  title={`Aplicar escala ${tier.label}`}
                >
                  <span className="text-[9px] text-[#78716C] leading-tight block mb-0.5">
                    {tier.label}
                  </span>
                  <span className="font-mono font-bold text-[11px] text-[#1F1E1D] leading-none">
                    {formatCurrencyARS(discounted)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* D. Fila de Compra: Selector de Cantidad + Agregar al Pedido */}
      <div className="p-3.5 sm:p-4 pt-0">
        <div className="flex items-center gap-2">
          {/* Stepper numérico */}
          <div className="flex items-center border border-[#D6CFC4] rounded-lg bg-white h-9 flex-shrink-0">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-2.5 h-full text-[#57534E] hover:bg-[#FAF8F5] text-sm font-bold transition-colors rounded-l-lg"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-8 text-center text-xs font-mono font-bold text-[#1F1E1D] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="px-2.5 h-full text-[#57534E] hover:bg-[#FAF8F5] text-sm font-bold transition-colors rounded-r-lg"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          {/* Botón Agregar al pedido */}
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 h-9 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#15232A] hover:bg-[#1E333F] text-white active:scale-[0.98]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
                <span className="truncate">Agregar al pedido</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Backward-compatible alias for existing imports
export const WholesaleProductCard = ProductCardB2B
