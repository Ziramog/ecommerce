import React from 'react'
import type { CommerceOrderConfirmation } from '@mercadal/commerce-core'

export interface OrderConfirmationViewProps {
  order: CommerceOrderConfirmation
  formatCurrency?: (val: number) => string
  className?: string
  paymentInstructions?: React.ReactNode
  themeClasses?: {
    card?: string
    title?: string
    button?: string
  }
}

export function OrderConfirmationView({
  order,
  formatCurrency = (val) => `$${val.toLocaleString('es-AR')}`,
  className = '',
  paymentInstructions,
  themeClasses = {},
}: OrderConfirmationViewProps) {
  const cardClass = themeClasses.card || 'p-8 bg-white border border-neutral-200 rounded-[2px] max-w-2xl mx-auto'
  const titleClass = themeClasses.title || 'text-2xl font-serif text-neutral-900 mb-2'
  const buttonClass =
    themeClasses.button ||
    'inline-block py-3 px-8 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 rounded-[2px]'

  const isPending = order.status === 'pending' || order.status === 'requires_action'
  const isCanceled = order.status === 'canceled' || order.status === 'archived'

  return (
    <div className={`${cardClass} ${className}`}>
      <div className="text-center pb-6 border-b border-neutral-200">
        {isPending ? (
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            ⏳
          </div>
        ) : isCanceled ? (
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            ✕
          </div>
        ) : (
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            ✓
          </div>
        )}

        <h1 className={titleClass}>
          {isPending
            ? 'Pedido Registrado — Pendiente de Pago'
            : isCanceled
            ? 'Pedido Cancelado'
            : '¡Gracias por tu compra!'}
        </h1>

        <p className="text-sm text-neutral-600">
          Tu pedido <span className="font-semibold text-neutral-900">#{order.displayId || order.id}</span>{' '}
          {isPending
            ? 'ha sido registrado y se encuentra a la espera de acreditación.'
            : isCanceled
            ? 'ha sido cancelado.'
            : 'ha sido confirmado con éxito.'}
        </p>

        {order.email && (
          <p className="text-xs text-neutral-500 mt-1">
            Enviamos el comprobante y seguimiento a: <span className="font-medium text-neutral-800">{order.email}</span>
          </p>
        )}
      </div>

      {paymentInstructions && (
        <div className="py-4 border-b border-neutral-200">
          {paymentInstructions}
        </div>
      )}

      {/* Order items */}
      <div className="py-6 border-b border-neutral-200 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">Artículos del Pedido</h2>
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-sm py-1">
            <span className="text-neutral-800">
              {it.title} <span className="text-neutral-500">× {it.quantity}</span>
            </span>
            <span className="font-semibold text-neutral-900">{formatCurrency(it.total)}</span>
          </div>
        ))}
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="py-6 border-b border-neutral-200 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">Destino de Entrega</h2>
          <p className="text-neutral-900 font-medium">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-neutral-600">{order.shippingAddress.address1}</p>
          <p className="text-neutral-600">
            {order.shippingAddress.city}, {order.shippingAddress.province} (CP: {order.shippingAddress.postalCode})
          </p>
        </div>
      )}

      {/* Total */}
      <div className="py-6 flex items-center justify-between text-base">
        <span className="font-bold text-neutral-900">{isPending ? 'Total a Abonar' : 'Total Abonado'}</span>
        <span className="font-bold text-neutral-900 text-xl">{formatCurrency(order.total)}</span>
      </div>

      <div className="text-center pt-4">
        <a href="/" className={buttonClass}>
          Volver a la Tienda
        </a>
      </div>
    </div>
  )
}
