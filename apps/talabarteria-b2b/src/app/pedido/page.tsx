'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useB2BCart } from '@/context/B2BCartContext'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { formatCurrencyARS } from '@/lib/utils'
import {
  Trash2,
  AlertTriangle,
  Building2,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'

export default function PedidoPage() {
  const {
    items,
    totalUnits,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
    isMinOrderMet,
    minWholesaleUnits,
    minWholesaleAmount,
  } = useB2BCart()
  const { user, isAuthenticated } = useAuthB2B()

  const [shippingMethod, setShippingMethod] = useState<'deposito' | 'expreso'>('expreso')
  const [expresoName, setExpresoName] = useState('Cruz del Sur')
  const [paymentTerms, setPaymentTerms] = useState<'transferencia' | 'cuenta_corriente'>(
    'transferencia'
  )
  const [confirmedOrder, setConfirmedOrder] = useState<string | null>(null)

  const handleConfirmOrder = () => {
    const orderId = `ORD-B2B-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    setConfirmedOrder(orderId)
    clearCart()
  }

  if (confirmedOrder) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center">
        <div className="bg-white p-8 rounded-lg border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <span className="text-xs uppercase font-bold text-emerald-700 tracking-widest block mb-1">
            Pedido Mayorista Confirmado
          </span>
          <h1 className="font-heading text-2xl font-bold text-navy uppercase mb-2 font-mono">
            {confirmedOrder}
          </h1>
          <p className="text-xs text-b2b-600 leading-relaxed mb-6">
            Hemos emitido la orden comercial para <strong>{user?.companyName}</strong> (CUIT {user?.cuit}). Se ha generado la proforma electrónica y la solicitud de reserva en el almacén digital.
          </p>

          <div className="bg-b2b-50 p-4 rounded text-left text-xs mb-6 space-y-1.5 border border-b2b-200">
            <div className="flex justify-between">
              <span className="text-b2b-500">Razón Social:</span>
              <span className="font-semibold text-navy">{user?.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-b2b-500">Modalidad de Despacho:</span>
              <span className="font-semibold text-navy">
                {shippingMethod === 'deposito' ? 'Retiro en Depósito CABA' : `Expreso: ${expresoName}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-b2b-500">Condición de Pago:</span>
              <span className="font-semibold text-navy">
                {paymentTerms === 'transferencia' ? 'Transferencia Bancaria' : 'Cuenta Corriente 30 Días'}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Link
              href="/catalogo"
              className="py-2.5 px-6 bg-navy hover:bg-navy-light text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              Volver al Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg border border-b2b-200 shadow-sm">
          <span className="text-xs uppercase font-bold text-saddle tracking-widest block mb-2">
            Pedido Vacío
          </span>
          <h2 className="font-heading text-xl font-bold text-navy uppercase mb-3">
            No hay productos en su orden comercial
          </h2>
          <p className="text-xs text-b2b-500 mb-6">
            Explore el catálogo mayorista o utilice la matriz de pedido rápido para cargar los artículos requeridos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/catalogo"
              className="py-2.5 px-5 bg-navy hover:bg-navy-light text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              Ir al Catálogo
            </Link>
            <Link
              href="/pedido-rapido"
              className="py-2.5 px-5 bg-saddle hover:bg-saddle-dark text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              Pedido Rápido (Matriz)
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <span className="text-xs uppercase font-bold text-saddle tracking-widest block mb-1">
          Consolidación de Compra Mayorista
        </span>
        <h1 className="font-heading text-3xl font-bold text-navy uppercase">
          Detalle del Pedido Comercial
        </h1>
      </div>

      {/* Minimum Wholesale Requirement Warning */}
      {!isMinOrderMet && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block font-semibold mb-0.5">
              Condición de compra mínima mayorista no alcanzada:
            </strong>
            El pedido actual cuenta con <strong>{totalUnits} unidades</strong> ({formatCurrencyARS(totalAmount)}). La política mayorista de Talabartería Mercadal requiere un mínimo de <strong>{minWholesaleUnits} unidades</strong> o <strong>{formatCurrencyARS(minWholesaleAmount)}</strong> de compra combinada para habilitar facturación y despacho.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-b2b-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-b2b-50 border-b border-b2b-200 flex justify-between items-center">
              <span className="text-xs font-semibold text-navy uppercase tracking-wider">
                Artículos ({items.length} líneas / {totalUnits} unidades)
              </span>
              <button
                onClick={clearCart}
                className="text-[11px] text-red-600 hover:text-red-800 font-semibold uppercase"
              >
                Vaciar Orden
              </button>
            </div>

            <div className="divide-y divide-b2b-100">
              {items.map((item) => (
                <div key={item.sku} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-mono text-[10px] font-bold text-saddle block">
                      {item.sku}
                    </span>
                    <h4 className="font-semibold text-navy text-sm">{item.title}</h4>
                    <span className="text-[11px] text-b2b-500 font-mono">
                      Precio base: {formatCurrencyARS(item.basePrice)} • Presentación: {item.packUnit}
                    </span>
                    {item.discountPercent > 0 && (
                      <span className="inline-block ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                        -{item.discountPercent}% volumen
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    {/* Stepper */}
                    <div className="flex items-center border border-b2b-300 rounded bg-white">
                      <button
                        onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                        className="px-2 py-1 text-b2b-600 hover:bg-b2b-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-xs font-mono font-bold text-b2b-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                        className="px-2 py-1 text-b2b-600 hover:bg-b2b-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right w-28">
                      <span className="font-mono font-bold text-navy text-sm block">
                        {formatCurrencyARS(item.totalPrice)}
                      </span>
                      <span className="text-[10px] text-b2b-400 font-mono">
                        {formatCurrencyARS(item.unitPrice)}/un
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.sku)}
                      className="text-b2b-400 hover:text-red-600 transition-colors p-1"
                      title="Quitar artículo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Options */}
          <div className="bg-white p-6 rounded-lg border border-b2b-200 shadow-sm">
            <h3 className="font-heading text-base font-bold text-navy uppercase mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-saddle" />
              Modalidad de Logística y Despacho
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded border cursor-pointer transition-colors ${
                  shippingMethod === 'expreso'
                    ? 'border-navy bg-navy/5 font-semibold'
                    : 'border-b2b-200 hover:bg-b2b-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'expreso'}
                    onChange={() => setShippingMethod('expreso')}
                    className="accent-navy"
                  />
                  <span className="text-xs font-bold text-navy">Despacho por Expreso al Interior</span>
                </div>
                <p className="text-[11px] text-b2b-500 pl-5">
                  Consolidado y entrega en terminal de transporte en CABA.
                </p>
              </label>

              <label
                className={`p-4 rounded border cursor-pointer transition-colors ${
                  shippingMethod === 'deposito'
                    ? 'border-navy bg-navy/5 font-semibold'
                    : 'border-b2b-200 hover:bg-b2b-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'deposito'}
                    onChange={() => setShippingMethod('deposito')}
                    className="accent-navy"
                  />
                  <span className="text-xs font-bold text-navy">Retiro por Depósito Central</span>
                </div>
                <p className="text-[11px] text-b2b-500 pl-5">
                  Av. Juan B. Justo 7820, CABA. Sin costo adicional.
                </p>
              </label>
            </div>

            {shippingMethod === 'expreso' && (
              <div className="mt-4 pt-4 border-t border-b2b-100">
                <label className="block text-xs font-semibold text-b2b-700 mb-1">
                  Empresa de Transporte / Expreso habitual:
                </label>
                <input
                  type="text"
                  value={expresoName}
                  onChange={(e) => setExpresoName(e.target.value)}
                  placeholder="Ej: La Sevillanita, Cruz del Sur, Expreso Luján..."
                  className="w-full sm:w-80 px-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-b2b-200 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-navy uppercase mb-4 pb-2 border-b border-b2b-200">
              Resumen de Facturación
            </h3>

            {/* Fiscal Box */}
            <div className="bg-b2b-50 p-3 rounded border border-b2b-200 text-xs mb-4">
              <span className="text-[10px] uppercase font-bold text-b2b-500 tracking-wider flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-navy" />
                Datos Fiscales de Factura A:
              </span>
              <strong className="text-navy block truncate">
                {user?.companyName || 'Empresa Registrada S.R.L.'}
              </strong>
              <span className="text-b2b-600 block font-mono text-[11px]">
                CUIT: {user?.cuit || '30-71234567-9'}
              </span>
              <span className="text-b2b-500 block text-[11px]">
                Condición: {user?.conditionIVA || 'IVA Responsable Inscripto'}
              </span>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between text-b2b-600">
                <span>Subtotal Neto Mayorista:</span>
                <span className="font-mono font-semibold text-navy">
                  {formatCurrencyARS(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-b2b-600">
                <span>IVA Estimado (21%):</span>
                <span className="font-mono font-semibold text-navy">
                  {formatCurrencyARS(Math.round(totalAmount * 0.21))}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-navy pt-2 border-t border-b2b-200">
                <span>Total Bruto Facturado:</span>
                <span className="font-mono text-emerald-800 text-base">
                  {formatCurrencyARS(Math.round(totalAmount * 1.21))}
                </span>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mb-6 pt-4 border-t border-b2b-100">
              <span className="text-xs font-semibold text-b2b-700 block mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-navy" />
                Condición de Pago Comercial:
              </span>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full p-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy bg-white text-b2b-900"
              >
                <option value="transferencia">Transferencia Bancaria Anticipada (-2% adicional)</option>
                <option value="cuenta_corriente">Cuenta Corriente Comercial 30 días</option>
              </select>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={!isMinOrderMet}
              className={`w-full py-3 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm ${
                isMinOrderMet
                  ? 'bg-navy hover:bg-navy-light text-white cursor-pointer'
                  : 'bg-b2b-200 text-b2b-400 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Confirmar Pedido Mayorista
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
