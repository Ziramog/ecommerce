'use client'

import React, { useState } from 'react'
import { useB2BCart, RFQRecord } from '@/context/B2BCartContext'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { formatCurrencyARS } from '@/lib/utils'
import { FileText, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CotizacionPage() {
  const { items, totalAmount, submitRFQ, rfqHistory } = useB2BCart()
  const { user } = useAuthB2B()
  const [notes, setNotes] = useState('')
  const [latestRfq, setLatestRfq] = useState<RFQRecord | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rfq = submitRFQ(notes)
    setLatestRfq(rfq)
    setNotes('')
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs uppercase font-bold text-saddle tracking-widest block mb-1">
          Oficina Técnica & Presupuestos
        </span>
        <h1 className="font-heading text-3xl font-bold text-navy uppercase">
          Solicitud de Cotización Especial (RFQ)
        </h1>
        <p className="text-xs text-b2b-500 mt-1">
          Canal directo para pedidos a granel, estancias, lotes corporativos o especificaciones especiales de sogueo y monturas.
        </p>
      </div>

      {latestRfq && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm">
              Solicitud de Cotización Registrada: {latestRfq.id}
            </h3>
          </div>
          <p className="text-xs leading-relaxed">
            Hemos recibido su solicitud de cotización para <strong>{user?.companyName || 'su empresa'}</strong>. Nuestro departamento técnico revisará las especificaciones y emitirá el presupuesto oficial dentro de las 24 hs hábiles.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-b2b-200 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-navy uppercase mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-saddle" />
              Nueva Solicitud de Presupuesto
            </h2>

            {items.length > 0 ? (
              <div className="mb-4 p-3 bg-b2b-50 rounded border border-b2b-200">
                <span className="text-xs font-semibold text-b2b-700 block mb-2">
                  Artículos incluidos desde su pedido actual ({items.length} líneas):
                </span>
                <ul className="text-xs space-y-1 font-mono text-b2b-600">
                  {items.map((i) => (
                    <li key={i.sku} className="flex justify-between">
                      <span>
                        {i.sku} — {i.title} (x{i.quantity})
                      </span>
                      <span className="font-bold text-navy">
                        {formatCurrencyARS(i.totalPrice)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 pt-2 border-t border-b2b-200 flex justify-between text-xs font-bold text-navy">
                  <span>Monto Base Estimado:</span>
                  <span>{formatCurrencyARS(totalAmount)}</span>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-b2b-50 rounded border border-b2b-200 text-xs text-b2b-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-b2b-400 shrink-0" />
                <span>
                  No hay productos cargados en el pedido. Puede detallar los ítems o requisitos directamente en las notas técnicas a continuación.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-b2b-700 mb-1">
                  Requerimientos Técnicos, Cantidades Especiales o Personalización *
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalle aquí: medidas especiales, cueros crudos o curtidos preferidos, iniciales o grabados en alpaca, plazos de entrega requeridos, expreso de destino, etc."
                  className="w-full p-3 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
                  required
                />
              </div>

              <div className="bg-b2b-50 p-3 rounded border border-b2b-200 text-[11px] text-b2b-600">
                <span>Razón Social / CUIT Solicitante: </span>
                <strong className="text-navy">{user?.companyName || 'Empresa Registrada'}</strong>
                {user?.cuit && ` (${user.cuit})`}
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 bg-saddle hover:bg-saddle-dark text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                Enviar Solicitud de Cotización
              </button>
            </form>
          </div>
        </div>

        {/* RFQ History */}
        <div>
          <div className="bg-white p-6 rounded-lg border border-b2b-200 shadow-sm">
            <h3 className="font-heading text-base font-bold text-navy uppercase mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-b2b-400" />
              Historial de Cotizaciones
            </h3>

            {rfqHistory.length === 0 ? (
              <p className="text-xs text-b2b-400 italic">
                Aún no ha emitido solicitudes de cotización previas.
              </p>
            ) : (
              <div className="space-y-3">
                {rfqHistory.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="p-3 bg-b2b-50 rounded border border-b2b-200 text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-navy">{rfq.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold uppercase">
                        {rfq.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-b2b-500 mb-1">Fecha: {rfq.date}</div>
                    <div className="text-[11px] font-mono font-semibold text-b2b-700">
                      Total ref: {formatCurrencyARS(rfq.totalEstimated)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
