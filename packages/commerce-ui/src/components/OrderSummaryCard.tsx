import React from 'react'
import type { CommerceCart } from '@mercadal/commerce-core'

export interface OrderSummaryCardProps {
  cart: CommerceCart
  formatCurrency?: (val: number) => string
  className?: string
  themeClasses?: {
    card?: string
    title?: string
    rowLabel?: string
    rowValue?: string
    totalRow?: string
  }
}

export function OrderSummaryCard({
  cart,
  formatCurrency = (val) => `$${val.toLocaleString('es-AR')}`,
  className = '',
  themeClasses = {},
}: OrderSummaryCardProps) {
  const cardClass = themeClasses.card || 'p-6 bg-white border border-neutral-200 rounded-[2px]'
  const titleClass =
    themeClasses.title || 'text-xs font-semibold uppercase tracking-widest text-neutral-800 pb-3 border-b border-neutral-200 mb-4'
  const rowLabelClass = themeClasses.rowLabel || 'text-sm text-neutral-600'
  const rowValueClass = themeClasses.rowValue || 'text-sm font-medium text-neutral-900'
  const totalRowClass =
    themeClasses.totalRow || 'pt-4 border-t border-neutral-200 flex items-center justify-between mt-4'

  return (
    <aside className={`${cardClass} ${className}`} aria-label="Resumen del pedido">
      <h2 className={titleClass}>Resumen del Pedido</h2>

      {/* Items preview */}
      <div className="space-y-3 pb-4 border-b border-neutral-100 max-h-72 overflow-y-auto">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 text-sm">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-12 h-12 object-cover rounded-[2px] border border-neutral-100 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-neutral-100 rounded-[2px] flex items-center justify-center text-neutral-400 text-xs flex-shrink-0">
                Item
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 truncate">{item.title}</p>
              <p className="text-xs text-neutral-500">
                Cant: {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <p className="font-semibold text-neutral-900">{formatCurrency(item.total)}</p>
          </div>
        ))}
      </div>

      {/* Calculation rows */}
      <div className="space-y-2.5 pt-4 text-sm">
        <div className="flex items-center justify-between">
          <span className={rowLabelClass}>Subtotal</span>
          <span className={rowValueClass}>{formatCurrency(cart.totals.subtotal)}</span>
        </div>

        {cart.totals.discountTotal > 0 && (
          <div className="flex items-center justify-between text-green-700">
            <span>Descuentos</span>
            <span>-{formatCurrency(cart.totals.discountTotal)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={rowLabelClass}>Envío</span>
          <span className={rowValueClass}>
            {cart.totals.shippingTotal === 0 ? 'Gratis / Por calcular' : formatCurrency(cart.totals.shippingTotal)}
          </span>
        </div>

        {cart.totals.taxTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className={rowLabelClass}>Impuestos (IVA 21% inc.)</span>
            <span className={rowValueClass}>{formatCurrency(cart.totals.taxTotal)}</span>
          </div>
        )}

        <div className={totalRowClass}>
          <span className="text-base font-bold text-neutral-900">Total</span>
          <span className="text-lg font-bold text-neutral-900">{formatCurrency(cart.totals.total)}</span>
        </div>
      </div>
    </aside>
  )
}
