'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, CheckCircle2, ArrowLeft, Clock, FileText, Phone } from 'lucide-react'

export default function ArrepentimientoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [claimCode, setClaimCode] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    dni: '',
    email: '',
    phone: '',
    orderNumber: '',
    purchaseDate: '',
    productsToRevoke: '',
    reason: '',
    confirmed: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.confirmed) {
      alert('Por favor confirme que los datos ingresados son correctos.')
      return
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const code = `REV-2026-${randomSuffix}`
    setClaimCode(code)
    setSubmitted(true)
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb / Retorno */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-pn-cognac hover:text-pn-espresso transition-colors font-medium"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Volver a la Tienda
          </Link>
        </div>

        {/* Encabezado Institucional */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 bg-pn-crema text-pn-espresso rounded-[2px] border border-pn-arena/50">
              <ShieldAlert size={22} className="text-pn-cognac" />
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-pn-cognac">
              Resolución 424/2020 SCI — Ley 24.240
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pn-espresso mb-4 tracking-tight">
            Botón de Arrepentimiento
          </h1>

          <p className="text-sm text-pn-espresso/80 leading-relaxed font-light mb-4">
            Conforme al <strong>Artículo 34 de la Ley N° 24.240 de Defensa del Consumidor</strong> y el{' '}
            <strong>Artículo 1.110 del Código Civil y Comercial de la Nación</strong>, usted tiene el derecho irrevocable
            de revocar la aceptación del producto adquirido dentro del plazo legal de <strong>10 (diez) días corridos</strong> contados a partir de la fecha de entrega del bien o de la celebración del contrato, lo último que ocurra.
          </p>

          <div className="bg-[#FAF7F2] border-l-2 border-pn-cognac p-4 text-xs text-pn-espresso/85 space-y-1.5 font-light">
            <p>
              • <strong>Cero costo para el consumidor:</strong> Los gastos de devolución corren por cuenta exclusiva de Talabartería Mercadal S.A.
            </p>
            <p>
              • <strong>Puesta a disposición:</strong> El producto debe ponerse a disposición del transporte sin uso indebido y en su embalaje de entrega.
            </p>
            <p>
              • <strong>Reintegro total:</strong> La devolución del dinero se efectúa mediante el mismo medio de pago utilizado en la transacción original.
            </p>
          </div>
        </div>

        {/* Formulario o Confirmación */}
        {submitted ? (
          <div className="bg-white border border-pn-arena/60 rounded-[3px] p-8 sm:p-10 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full mb-5 border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>

            <span className="text-xs uppercase tracking-[0.2em] text-emerald-800 font-semibold block mb-1">
              Solicitud de Revocación Registrada
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pn-espresso mb-3">
              Código de Gestión Oficial
            </h2>

            <div className="inline-block bg-[#FAF7F2] border-2 border-pn-cognac/40 px-6 py-3 rounded-[3px] my-3">
              <span className="font-mono text-xl sm:text-2xl font-bold text-pn-espresso tracking-wider select-all">
                {claimCode}
              </span>
            </div>

            <p className="text-xs text-pn-espresso/70 mb-6 font-light">
              Fecha y hora de emisión: {new Date().toLocaleString('es-AR')}
            </p>

            <div className="text-left bg-[#FAF7F2] p-5 rounded-[2px] border border-[#EFE8DE] text-xs text-pn-espresso/85 space-y-2 mb-8 font-light">
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-pn-cognac flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Plazo de contacto:</strong> Nuestro equipo de postventa se comunicará al correo{' '}
                  <span className="font-medium text-pn-espresso">{formData.email}</span> o teléfono{' '}
                  <span className="font-medium text-pn-espresso">{formData.phone}</span> dentro de las siguientes{' '}
                  <strong>24 horas hábiles</strong> para coordinar el retiro sin cargo del paquete en su domicilio.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-pn-cognac flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Comprobante por email:</strong> Se ha emitido una constancia digital con este código de gestión a su casilla de correo electrónico.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-pn-cognac flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Atención directa:</strong> Si desea realizar el seguimiento de su solicitud, comuníquese a{' '}
                  <span className="font-medium text-pn-espresso">soporte@pampanovus.com.ar</span> indicando el código{' '}
                  {claimCode}.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-block bg-pn-espresso text-pn-crema px-8 py-3 rounded-[2px] text-xs uppercase tracking-[0.16em] font-medium hover:bg-pn-cognac transition-colors"
            >
              Regresar al Inicio
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm space-y-6"
          >
            <h2 className="font-serif text-xl font-bold text-pn-espresso border-b border-[#EFE8DE] pb-3">
              Datos para la Gestión de Revocación
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                  Nombre y Apellido Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Martín Fierro"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                  DNI o CUIT del Titular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 30-71234567-8 o DNI"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                  Correo Electrónico de Compra *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                  Teléfono de Contacto / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: +54 9 11 5555-7267"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                  Número de Pedido o Factura *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: PN-2026-4891 o Factura B"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                  Fecha de Recepción del Producto *
                </label>
                <input
                  type="date"
                  required
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                Detalle de los Productos a Revocar *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Indique los artículos específicos que desea devolver (ej: Montura Criolla SKU-CRI-001)"
                value={formData.productsToRevoke}
                onChange={(e) => setFormData({ ...formData, productsToRevoke: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                Motivo de la Decisión (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Opcional. Nos ayuda a perfeccionar la artesanía y servicio de nuestras piezas."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.confirmed}
                  onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                  className="mt-1 h-4 w-4 text-pn-cognac border-gray-300 rounded focus:ring-pn-cognac"
                />
                <span className="text-xs text-pn-espresso/80 font-light leading-relaxed">
                  Declaro que la presente solicitud se formula dentro del plazo de 10 días corridos de recibido el producto y que el mismo se encuentra a disposición para su retiro sin signos de uso indebido.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#EFE8DE] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-pn-espresso/60 font-light">
                * Campos obligatorios para la asignación del código oficial
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto bg-pn-espresso text-pn-crema px-8 py-3 rounded-[2px] text-xs uppercase tracking-[0.16em] font-medium hover:bg-pn-cognac transition-colors"
              >
                Confirmar y Obtener Código de Revocación
              </button>
            </div>
          </form>
        )}

        {/* Nota Legal Regulatoria de Descargo */}
        <div className="mt-8 text-center text-[11px] text-pn-espresso/60 font-light leading-relaxed">
          <p>
            Talabartería Mercadal S.A. · CUIT 30-71234567-8 · Canal Minorista Pampa Novus.
            <br />
            Defensa de las y los Consumidores: Para conocer sus derechos, consulte la web de la Dirección Nacional de Defensa del Consumidor en{' '}
            <a
              href="https://www.argentina.gob.ar/defensadelconsumidor"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pn-espresso"
            >
              argentina.gob.ar/defensadelconsumidor
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
