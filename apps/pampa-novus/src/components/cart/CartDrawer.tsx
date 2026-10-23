'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatCurrencyARS } from '@/lib/utils'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, totalItems, updateQuantity, removeItem } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-pampa-50 text-pampa-950 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-pampa-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5 text-leather" />
              <h2 className="font-serif text-lg font-bold tracking-wider uppercase text-pampa-950">
                Tu Carrito ({totalItems})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="text-pampa-500 hover:text-pampa-900 p-1.5 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-16 h-16 text-pampa-300 stroke-[1.2] mb-4" />
                <h3 className="font-serif text-lg text-pampa-800 font-semibold mb-2">Tu bolsa está vacía</h3>
                <p className="text-xs text-pampa-500 max-w-xs mb-6">
                  Descubrí piezas únicas forjadas por nuestros maestros talabarteros.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-pampa-950 text-white text-xs uppercase tracking-widest font-medium hover:bg-leather transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="flex gap-4 pb-6 border-b border-pampa-200 last:border-b-0">
                  <div className="relative w-20 h-24 bg-pampa-200 flex-shrink-0 overflow-hidden rounded">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pampa-400 text-xs">
                        Cuero
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/productos/${item.handle}`}
                          onClick={closeCart}
                          className="font-serif text-sm font-semibold text-pampa-950 hover:text-leather transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-pampa-400 hover:text-red-700 p-1"
                          aria-label="Eliminar ítem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-[11px] text-pampa-500 font-mono mt-0.5">SKU: {item.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-pampa-300 rounded bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-pampa-600 hover:text-pampa-950"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-pampa-600 hover:text-pampa-950"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-sm font-bold text-pampa-950">
                          {formatCurrencyARS(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-pampa-200 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-pampa-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-bold text-base text-pampa-950">
                    {formatCurrencyARS(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-pampa-500">
                  <span>Envío</span>
                  <span className="text-green-700 font-medium">Calculado en el checkout</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 bg-leather text-white flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-leather-dark transition-colors shadow-md rounded"
              >
                <span>Iniciar Compra Segura</span>
                <ArrowRight size={16} />
              </Link>

              <div className="text-center text-[11px] text-pampa-500">
                <span>🛡️ Compra protegida | Pagos procesados en Staging ARS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
