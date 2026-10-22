'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { B2BProduct } from '@/lib/catalog'
import { formatCurrencyARS, calculateVolumeDiscount, DEFAULT_VOLUME_TIERS } from '@/lib/utils'
import { useB2BCart } from '@/context/B2BCartContext'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { ShoppingCart, Check, Heart, ChevronDown, ChevronUp, Lock } from 'lucide-react'

export interface ProductCardB2BProps {
  product: B2BProduct
  showPriceOnlyAuth?: boolean
}

export function ProductCardB2B({ product, showPriceOnlyAuth = false }: ProductCardB2BProps) {
  const { addItem } = useB2BCart()
  const { isAuthenticated } = useAuthB2B()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [showTiers, setShowTiers] = useState(false)

  const activeTiers =
    product.volumeTiers && product.volumeTiers.length > 0
      ? product.volumeTiers
      : DEFAULT_VOLUME_TIERS

  const { unitPrice } = calculateVolumeDiscount(
    product.wholesalePrice,
    qty,
    activeTiers
  )

  // Find tier with maximum discount
  const bestTier = activeTiers.reduce((max, t) =>
    t.discountPercent > max.discountPercent ? t : max,
    activeTiers[0]
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
    <div className="w-full h-full min-w-0 bg-white border border-[#E5E5E5] rounded hover:border-[#B49272] transition-colors flex flex-col justify-between group overflow-hidden">
      <div>
        {/* A. Fotografía 1:1, object-contain limpio y escala aparente unificada */}
        <div className="relative aspect-square bg-[#FAFAFA] border-b border-[#F0F0F0] overflow-hidden flex items-center justify-center">
          <Link
            href={`/productos/${product.handle}`}
            className="block w-full h-full relative cursor-pointer group/img"
          >
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-contain p-4 sm:p-5 group-hover/img:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-[#A3A3A3] text-xs">
                Sin fotografía
              </div>
            )}
          </Link>

          {/* Badge Superior Izquierdo: SKU discreto */}
          <div className="absolute top-2 left-2 bg-[#F5F5F5] text-[#525252] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs border border-[#E5E5E5] pointer-events-none">
            {product.sku || 'SKU'}
          </div>

          {/* Badge Superior Derecho: Favorito */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setFavorited(!favorited)
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-xs bg-white/90 border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:text-[#873427] transition-colors z-10"
            aria-label="Agregar a favoritos"
          >
            <Heart
              className={`w-3.5 h-3.5 ${favorited ? 'fill-[#873427] text-[#873427]' : ''}`}
            />
          </button>

          {/* Badge Inferior Izquierdo: Estado de Disponibilidad */}
          <div className="absolute bottom-2 left-2 pointer-events-none">
            {product.inStock ? (
              <span className="bg-white/95 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-xs border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                En stock
              </span>
            ) : (
              <span className="bg-white/95 text-[#873427] text-[10px] font-semibold px-2 py-0.5 rounded-xs border border-[#F5D5CE] flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#873427]" />
                Próximamente
              </span>
            )}
          </div>
        </div>

        {/* B. Información Comercial */}
        <div className="p-3 sm:p-3.5 pb-2">
          {/* Título: Sans-serif comercial destacado, máximo 2 líneas */}
          <h3 className="font-sans text-sm font-bold text-[#202020] leading-snug line-clamp-2 hover:text-[#873427] transition-colors mb-1 min-h-[2.5rem]">
            <Link href={`/productos/${product.handle}`}>
              {product.title}
            </Link>
          </h3>

          {/* Descripción corta discreta */}
          <p className="text-[11px] text-[#525252] line-clamp-1 leading-relaxed font-normal mb-2">
            {product.description || 'Pieza tradicional con manufactura ecuestre certificada.'}
          </p>

          {/* Precio Mayorista Sans-Serif Destacado o Estado Reservado */}
          {showPriceOnlyAuth && !isAuthenticated ? (
            <div className="py-2.5">
              <div className="flex items-center gap-1.5 text-xs text-[#737373] font-medium">
                <Lock className="w-3.5 h-3.5 text-[#873427] flex-shrink-0" />
                <span>Precios y stock reservados</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-sans text-2xl font-extrabold text-[#202020] leading-none tracking-tight">
                  {formatCurrencyARS(unitPrice)}
                </span>
                <span className="text-xs text-[#525252] font-semibold">
                  /{isPack ? 'pack' : 'un'}
                </span>
              </div>

              {/* C. Descuento por Volumen Resumido (Criterio Mercado Libre) */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between gap-1">
                  {bestTier && bestTier.discountPercent > 0 ? (
                    <span className="inline-flex items-center text-[11px] font-semibold text-[#873427] bg-[#FDF4F2] border border-[#F5D5CE] px-1.5 py-0.5 rounded-xs">
                      Desde {bestTier.minQty} un.: -{bestTier.discountPercent}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#737373]">
                      Precio mayorista lista
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowTiers(!showTiers)}
                    className="text-[10px] font-medium text-[#737373] hover:text-[#873427] hover:underline flex items-center gap-0.5"
                  >
                    <span>{showTiers ? 'Cerrar' : 'Ver escalas'}</span>
                    {showTiers ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Escalas desplegables */}
                {showTiers && (
                  <div className="mt-1.5 p-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xs space-y-1 text-[10px]">
                    {activeTiers.map((tier) => {
                      const discounted = Math.round(
                        product.wholesalePrice * (1 - tier.discountPercent / 100)
                      )
                      return (
                        <div
                          key={tier.minQty}
                          className="flex items-center justify-between text-[#525252]"
                        >
                          <span>{tier.label}:</span>
                          <span className="font-mono font-bold text-[#202020]">
                            {formatCurrencyARS(discounted)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* D. Fila de Compra: Stepper + Agregar al Pedido o Botón de Acceso */}
      <div className="p-3 sm:p-3.5 pt-0">
        {showPriceOnlyAuth && !isAuthenticated ? (
          <Link
            href="/acceso"
            className="w-full h-8 px-2.5 rounded bg-[#FAF8F5] hover:bg-[#F0ECE6] border border-[#E5E5E5] text-[11px] font-bold text-[#202020] uppercase tracking-wider flex items-center justify-center transition-colors"
          >
            Consultar acceso
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            {/* Stepper numérico */}
            <div className="flex items-center border border-[#D4D4D4] rounded bg-white h-8 flex-shrink-0">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-7 h-full text-[#525252] hover:bg-[#F5F5F5] text-xs font-bold transition-colors flex items-center justify-center"
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-8 text-center text-xs font-mono font-bold text-[#202020] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="w-7 h-full text-[#525252] hover:bg-[#F5F5F5] text-xs font-bold transition-colors flex items-center justify-center"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            {/* Botón Agregar al pedido */}
            <button
              type="button"
              onClick={handleAdd}
              className={`flex-1 h-8 px-2.5 rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#172B23] hover:bg-[#0F1D17] text-white active:scale-[0.98]'
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
        )}
      </div>
    </div>
  )
}

// Backward-compatible alias for existing imports
export const WholesaleProductCard = ProductCardB2B
