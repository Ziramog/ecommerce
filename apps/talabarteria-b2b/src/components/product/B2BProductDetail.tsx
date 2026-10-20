'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { B2BProduct } from '@/lib/catalog'
import { formatCurrencyARS, calculateVolumeDiscount, DEFAULT_VOLUME_TIERS } from '@/lib/utils'
import { useB2BCart } from '@/context/B2BCartContext'
import {
  ShoppingCart,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  FileCheck2,
  Package,
  Layers,
  Heart,
  Tag,
  Percent,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Maximize2
} from 'lucide-react'

interface B2BProductDetailProps {
  product: B2BProduct
}

export function B2BProductDetail({ product }: B2BProductDetailProps) {
  const { addItem } = useB2BCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

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
    setTimeout(() => setAdded(false), 2000)
  }

  const bestTier = activeTiers[activeTiers.length - 1]

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-6 sm:py-8 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#78716C] mb-6 font-medium">
          <Link href="/" className="hover:text-[#1F1E1D] transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href="/catalogo" className="hover:text-[#1F1E1D] transition-colors">
            Catálogo Comercial
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1F1E1D] font-semibold truncate max-w-md">
            {product.title}
          </span>
        </nav>

        {/* 2. Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          {/* Columna Izquierda: Galería de Fotografía Técnica (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-white border border-[#E8E2D8] rounded-2xl overflow-hidden shadow-xs group">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  priority
                  className="object-contain p-6 sm:p-8 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-[#A8A29E] text-sm">
                  Sin fotografía técnica
                </div>
              )}

              {/* SKU & Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-[#18261E] text-white text-xs font-mono font-bold px-3 py-1 rounded-md shadow-xs">
                  {product.sku || 'SKU-001'}
                </span>
                <span className="bg-[#8A311F] text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                  Canal Mayorista
                </span>
              </div>

              {/* Unidad / Pack y Favorito */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="bg-white/95 text-[#292524] text-xs font-semibold px-3 py-1 rounded-md border border-[#E8E2D8] flex items-center gap-1.5 shadow-xs">
                  <Package className="w-3.5 h-3.5 text-[#8A311F]" />
                  <span>{product.packUnit || 'Unidad'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="w-8 h-8 rounded-full bg-white/95 border border-[#E8E2D8] flex items-center justify-center text-[#78716C] hover:text-[#1F1E1D] transition-colors shadow-xs"
                  title="Ver en pantalla completa"
                  aria-label="Ver en pantalla completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setFavorited(!favorited)}
                  className="w-8 h-8 rounded-full bg-white/95 border border-[#E8E2D8] flex items-center justify-center text-[#78716C] hover:text-[#8A311F] transition-colors shadow-xs"
                  aria-label="Guardar en favoritos"
                >
                  <Heart
                    className={`w-4 h-4 ${favorited ? 'fill-[#8A311F] text-[#8A311F]' : ''}`}
                  />
                </button>
              </div>

              {/* Footnote informativo: Foto 100% íntegra sin cortes */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-[#78716C]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Fotografía real de catálogo sin recortes
                </span>
                <span className="hidden sm:inline">Fabricación Mercadal</span>
              </div>
            </div>

            {/* Modal de Pantalla Completa si el usuario hace clic en el zoom */}
            {isZoomed && product.thumbnail && (
              <div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setIsZoomed(false)}
              >
                <div className="relative max-w-4xl max-h-[90vh] w-full h-[80vh] bg-white rounded-2xl overflow-hidden p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D8]">
                    <span className="font-serif text-lg font-bold text-[#1F1E1D]">
                      {product.title} ({product.sku})
                    </span>
                    <button
                      onClick={() => setIsZoomed(false)}
                      className="px-3 py-1 bg-[#FAF8F5] border border-[#D6CFC4] rounded-lg text-xs font-bold hover:bg-[#EFEAE2]"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="relative flex-1 my-4">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-center text-xs text-[#78716C]">
                    Haga clic en cualquier lugar para cerrar
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Especificaciones Comerciales y Compra (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#E8E2D8] rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Header info */}
            <div className="mb-4 pb-4 border-b border-[#E8E2D8]">
              <div className="flex items-center gap-3 text-xs mb-2">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Stock Digital Disponible
                </span>
                <span className="text-[#D6CFC4]">•</span>
                <span className="text-[#78716C] font-mono">
                  Línea Mayorista José Mercadal
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1E1D] leading-tight mb-3">
                {product.title}
              </h1>

              <p className="text-sm text-[#57534E] leading-relaxed">
                {product.description ||
                  'Pieza artesanal confeccionada con especificaciones técnicas para talabarterías, veterinarias rurales, pet shops y comercios del rubro ecuestre.'}
              </p>
            </div>

            {/* Caja de Precio Mayorista */}
            <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-xl border border-[#E8E2D8] mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-[#78716C] tracking-wider">
                  Precio Mayorista Neto:
                </span>
                <span className="text-xs text-[#8A311F] font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Factura A con discriminación de IVA
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1F1E1D]">
                  {formatCurrencyARS(unitPrice)}
                </span>
                <span className="text-sm font-semibold text-[#78716C]">
                  / {product.packUnit || 'unidad'}
                </span>
              </div>

              <span className="text-xs text-[#57534E] block">
                Precio unitario para la cantidad seleccionada ({qty} {product.packUnit || 'un.'})
                {discountPercent > 0 && (
                  <strong className="text-emerald-700 ml-1">
                    (Aplica {discountPercent}% de bonificación por escala)
                  </strong>
                )}
              </span>
            </div>

            {/* Escalas de Descuento por Volumen */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs uppercase font-bold text-[#44403C] tracking-wider flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#8A311F]" />
                  Escalas de bonificación comercial:
                </span>
                <span className="text-xs text-[#78716C]">Haga clic en la escala para aplicarla</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isActive
                          ? 'border-[#D48D70] bg-[#FFF8F0] shadow-xs'
                          : 'border-[#E8E2D8] bg-white hover:border-[#D6CFC4] text-[#57534E]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs mb-1">
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#8A311F] flex-shrink-0" />
                        )}
                        <span className={isActive ? 'font-bold text-[#8A311F]' : 'font-semibold'}>
                          {tier.label}
                        </span>
                      </div>
                      <div className="font-bold text-sm font-mono text-[#1F1E1D]">
                        {formatCurrencyARS(discounted)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Fila de Compra: Selector de Cantidad + Sumar al Pedido */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
              {/* Selector de cantidad */}
              <div className="flex items-center border border-[#D6CFC4] rounded-xl bg-white h-12 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 h-full text-[#57534E] hover:bg-[#FAF8F5] text-lg font-bold transition-colors rounded-l-xl"
                  aria-label="Disminuir cantidad"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-center text-base font-mono font-bold text-[#1F1E1D] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="px-4 h-full text-[#57534E] hover:bg-[#FAF8F5] text-lg font-bold transition-colors rounded-r-xl"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              {/* Botón Sumar al Pedido */}
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 h-12 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#15232A] hover:bg-[#1E333F] text-white active:scale-[0.98]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>¡Agregado al Pedido Mayorista!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 stroke-[2]" />
                    <span>Sumar {formatCurrencyARS(totalPrice)} al Pedido</span>
                  </>
                )}
              </button>
            </div>

            {/* Enlace a Pedido Rápido */}
            <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#1F1E1D] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Catálogo</span>
              </Link>

              <Link
                href="/pedido-rapido"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A311F] hover:underline"
              >
                <Layers className="w-4 h-4 text-[#C86D51]" />
                <span>Cargar en Modo Matriz Masiva</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Garantías Comerciales y Fiscales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-[#E8E2D8] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E8E2D8] flex items-center justify-center text-[#8A311F] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1F1E1D] text-sm mb-1">
                Facturación Oficial ARCA
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Emisión automática de Factura A con IVA discriminado para comercios y distribuidores inscriptos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E8E2D8] flex items-center justify-center text-[#8A311F] flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1F1E1D] text-sm mb-1">
                Logística y Expresos Nacionales
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Despachos diarios consolidando con expresos al interior del país, retiro en depósito o entrega programada.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E8E2D8] flex items-center justify-center text-[#8A311F] flex-shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1F1E1D] text-sm mb-1">
                Garantía y Tradición Mercadal
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Fabricación artesanal en cuero seleccionado, control de calidad individual y reposición comercial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
