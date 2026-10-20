'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatCurrencyARS, formatInstallments } from '@/lib/utils'
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Lock, CreditCard } from 'lucide-react'

export default function CarritoPage() {
  const { items, subtotal, totalItems, updateQuantity, removeItem, clearCart } = useCart()
  const [postalCode, setPostalCode] = useState('')
  const [shippingCalculated, setShippingCalculated] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState<string | null>(null)

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault()
    if (postalCode.trim().length >= 4) {
      setShippingCalculated(true)
    }
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    setTimeout(() => {
      const orderId = 'order_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      setCheckoutComplete(orderId)
      clearCart()
      setIsCheckingOut(false)
    }, 1500)
  }

  if (checkoutComplete) {
    return (
      <div className="py-20 bg-pampa-50">
        <div className="max-w-2xl mx-auto px-4 text-center bg-white p-10 rounded-lg border border-pampa-200 shadow-luxury">
          <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <span className="text-xs uppercase tracking-widest text-leather font-semibold block mb-2">
            ¡Compra Confirmada!
          </span>
          <h1 className="font-serif text-3xl font-bold text-pampa-950 mb-4">
            Gracias por elegir Pampa Novus
          </h1>
          <p className="text-sm text-pampa-600 mb-6">
            Tu pedido fue procesado exitosamente en el canal minorista B2C. Recibirás un correo con la guía de despacho y el seguimiento de tu pieza artesanal.
          </p>
          <div className="p-4 bg-pampa-100 rounded mb-8 font-mono text-xs text-pampa-800">
            Identificador de Orden: <span className="font-bold">{checkoutComplete}</span>
          </div>
          <Link
            href="/catalogo"
            className="inline-block py-3 px-8 bg-leather hover:bg-leather-dark text-white text-xs uppercase tracking-widest font-semibold rounded transition-colors"
          >
            Volver al Catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-pampa-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-pampa-600 hover:text-leather transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Continuar Comprando</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pampa-950 tracking-tight">
            Bolsa de Compras ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-pampa-200 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-pampa-900 mb-3">No hay productos en tu carrito</h2>
            <p className="text-sm text-pampa-600 mb-8 max-w-sm mx-auto">
              Recorré nuestro catálogo para descubrir monturas criollas, cinturones de carpincho y piezas artesanales exclusivas.
            </p>
            <Link
              href="/catalogo"
              className="py-3 px-8 bg-leather hover:bg-leather-dark text-white text-xs uppercase tracking-widest font-semibold rounded transition-colors inline-block"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-white p-5 rounded-lg border border-pampa-200 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-sm"
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-24 bg-pampa-100 rounded overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-pampa-400">
                          Pampa
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/productos/${item.handle}`}
                        className="font-serif text-base font-semibold text-pampa-950 hover:text-leather transition-colors block mb-1"
                      >
                        {item.title}
                      </Link>
                      <span className="text-[11px] font-mono text-pampa-500 uppercase block mb-1">
                        SKU: {item.sku}
                      </span>
                      <span className="text-xs text-pampa-600 font-medium sm:hidden">
                        {formatCurrencyARS(item.price)} c/u
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                    {/* Quantity Modifier */}
                    <div className="flex items-center border border-pampa-300 rounded bg-pampa-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-2 text-pampa-600 hover:text-pampa-950"
                        aria-label="Disminuir"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-2 text-pampa-600 hover:text-pampa-950"
                        aria-label="Aumentar"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right min-w-[100px]">
                      <span className="font-serif text-base font-bold text-pampa-950 block">
                        {formatCurrencyARS(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-pampa-400 hover:text-red-700 p-2"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Column */}
            <div className="bg-white p-6 rounded-lg border border-pampa-200 shadow-sm h-fit space-y-6">
              <h2 className="font-serif text-lg font-bold text-pampa-950 pb-3 border-b border-pampa-200">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 text-xs text-pampa-700">
                <div className="flex justify-between">
                  <span>Subtotal productos</span>
                  <span className="font-semibold text-pampa-950">{formatCurrencyARS(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Envío a domicilio</span>
                  <span className={shippingCalculated ? 'font-semibold text-green-700' : 'text-pampa-500'}>
                    {shippingCalculated ? 'Bonificado (Gratis)' : 'Calculá tu código postal'}
                  </span>
                </div>
              </div>

              {/* Shipping Calculator */}
              <form onSubmit={handleCalculateShipping} className="pt-3 border-t border-pampa-100">
                <label htmlFor="cp" className="block text-[11px] uppercase tracking-wider text-pampa-600 font-medium mb-1.5">
                  Calcular costo de envío (CP)
                </label>
                <div className="flex gap-2">
                  <input
                    id="cp"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Ej: 1425"
                    className="flex-1 px-3 py-2 text-xs border border-pampa-300 rounded focus:outline-none focus:border-leather"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pampa-100 hover:bg-pampa-200 text-pampa-900 text-xs font-semibold rounded uppercase tracking-wider"
                  >
                    Calcular
                  </button>
                </div>
                {shippingCalculated && (
                  <p className="text-[11px] text-green-700 font-medium mt-1.5">
                    ✓ Envío Estandar Mercadal bonificado para CP {postalCode}
                  </p>
                )}
              </form>

              {/* Total */}
              <div className="pt-4 border-t border-pampa-200">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-serif text-base font-bold text-pampa-950">Total</span>
                  <span className="font-serif text-2xl font-bold text-pampa-950">
                    {formatCurrencyARS(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-pampa-600">
                  {formatInstallments(subtotal, 3)}
                </p>
              </div>

              {/* Checkout Trigger */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-4 bg-leather hover:bg-leather-dark text-white rounded text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center space-x-2 transition-colors shadow-md disabled:opacity-50"
              >
                <Lock size={15} />
                <span>{isCheckingOut ? 'Procesando en Staging...' : 'Finalizar Compra Segura'}</span>
              </button>

              <div className="pt-2 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-xs text-pampa-500">
                  <CreditCard size={14} className="text-leather" />
                  <span>Mercado Pago & Todas las Tarjetas</span>
                </div>
                <div className="text-[10px] text-pampa-400">
                  Transacción protegida por Medusa 2 Checkout Workflow
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
