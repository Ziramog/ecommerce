'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { B2BProduct } from '@/lib/catalog'
import { formatCurrencyARS, calculateVolumeDiscount } from '@/lib/utils'
import { useB2BCart } from '@/context/B2BCartContext'
import { Check, ShoppingCart, AlertCircle } from 'lucide-react'

export function BulkOrderMatrix({ products }: { products: B2BProduct[] }) {
  const router = useRouter()
  const { addBulkItems } = useB2BCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleQtyChange = (sku: string, value: string) => {
    const parsed = parseInt(value, 10)
    setQuantities((prev) => ({
      ...prev,
      [sku]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }))
  }

  const handleAddAll = () => {
    const toAdd = products
      .filter((p) => (quantities[p.sku] || 0) > 0)
      .map((p) => ({
        product: p,
        quantity: quantities[p.sku],
      }))

    if (toAdd.length === 0) return

    addBulkItems(toAdd)
    setSubmitted(true)
    setTimeout(() => {
      router.push('/pedido')
    }, 800)
  }

  // Calculate live totals for the matrix
  let totalMatrixUnits = 0
  let totalMatrixAmount = 0

  products.forEach((p) => {
    const q = quantities[p.sku] || 0
    if (q > 0) {
      totalMatrixUnits += q
      const { totalPrice } = calculateVolumeDiscount(p.wholesalePrice, q, p.volumeTiers)
      totalMatrixAmount += totalPrice
    }
  })

  return (
    <div className="bg-white rounded-lg border border-b2b-200 overflow-hidden shadow-sm">
      <div className="p-4 bg-b2b-50 border-b border-b2b-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-navy uppercase tracking-wider">
            Matriz de Pedido Rápido Mayorista
          </h2>
          <p className="text-xs text-b2b-500">
            Ingrese directamente las cantidades requeridas por SKU para consolidar un pedido masivo en un solo paso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-b2b-500 block">Total Unidades:</span>
            <span className="font-mono font-bold text-navy text-sm">{totalMatrixUnits} un.</span>
          </div>
          <div className="text-right border-l border-b2b-300 pl-3">
            <span className="text-[11px] text-b2b-500 block">Subtotal Estimado:</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {formatCurrencyARS(totalMatrixAmount)}
            </span>
          </div>
          <button
            onClick={handleAddAll}
            disabled={totalMatrixUnits === 0}
            className={`py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              totalMatrixUnits > 0
                ? 'bg-saddle hover:bg-saddle-dark text-white cursor-pointer shadow-sm'
                : 'bg-b2b-200 text-b2b-400 cursor-not-allowed'
            }`}
          >
            {submitted ? (
              <>
                <Check className="w-4 h-4 text-white" />
                Agregado al Pedido...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Cargar Todo al Pedido
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-b2b-100/70 border-b border-b2b-200 text-b2b-600 uppercase font-semibold">
              <th className="py-2.5 px-3 font-mono">SKU</th>
              <th className="py-2.5 px-3">Producto / Presentación</th>
              <th className="py-2.5 px-3 text-right">Precio Base</th>
              <th className="py-2.5 px-3 text-center">Escalas</th>
              <th className="py-2.5 px-3 text-center w-28">Cantidad</th>
              <th className="py-2.5 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-b2b-100 font-sans">
            {products.map((p) => {
              const currentQty = quantities[p.sku] || 0
              const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
                p.wholesalePrice,
                currentQty > 0 ? currentQty : 1,
                p.volumeTiers
              )

              return (
                <tr
                  key={p.sku}
                  className={`hover:bg-b2b-50/60 transition-colors ${
                    currentQty > 0 ? 'bg-saddle/5 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-navy">
                    {p.sku}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-b2b-900 block">{p.title}</span>
                    <span className="text-[10px] text-b2b-500 font-mono">
                      Presentación: {p.packUnit}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-b2b-700">
                    {formatCurrencyARS(p.wholesalePrice)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {currentQty >= 10 ? (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded font-bold font-mono">
                        -20%
                      </span>
                    ) : currentQty >= 5 ? (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded font-bold font-mono">
                        -10%
                      </span>
                    ) : (
                      <span className="text-[10px] text-b2b-400">1-4 base</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="number"
                      min="0"
                      value={quantities[p.sku] ?? ''}
                      placeholder="0"
                      onChange={(e) => handleQtyChange(p.sku, e.target.value)}
                      className="w-20 px-2 py-1 text-center font-mono font-bold border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900 bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">
                    {currentQty > 0 ? formatCurrencyARS(totalPrice) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-b2b-50 text-[11px] text-b2b-500 flex items-center gap-2 border-t border-b2b-200">
        <AlertCircle className="w-4 h-4 text-b2b-400 shrink-0" />
        <span>
          Las escalas de descuento (-10% a partir de 5 un. y -20% a partir de 10 un.) se computan en tiempo real según el volumen por línea.
        </span>
      </div>
    </div>
  )
}
