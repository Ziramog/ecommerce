'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, CheckCircle2, ArrowLeft, Clock, FileText, Phone, Printer, AlertTriangle } from 'lucide-react'
import { CLIENT_COMMERCIAL_CONFIG } from '@/config/client-commercial-config'

export default function ArrepentimientoPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [claimResponse, setClaimResponse] = useState<{
    claimId: string
    createdAt: string
    status: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    dniOrCuit: '',
    email: '',
    phone: '',
    orderNumber: '',
    deliveryDate: '',
    productsToRevoke: '',
    reason: '',
    termsAccepted: false,
  })

  const { company, contact } = CLIENT_COMMERCIAL_CONFIG

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!formData.termsAccepted) {
      setErrorMessage('Por favor confirme la declaración jurada sobre el estado del producto y plazos.')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/arrepentimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          dniOrCuit: formData.dniOrCuit,
          email: formData.email,
          phone: formData.phone,
          orderNumber: formData.orderNumber,
          deliveryDate: formData.deliveryDate,
          productsToRevoke: formData.productsToRevoke,
          reason: formData.reason,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al registrar la solicitud.')
      }

      setClaimResponse({
        claimId: data.claimId,
        createdAt: data.createdAt,
        status: data.status,
      })
      setSubmitted(true)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado de comunicación.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Retorno */}
        <div className="mb-6 print:hidden">
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
              Defensa del Consumidor · Disp. 954/2025 & Ley 24.240
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pn-espresso mb-4 tracking-tight">
            Botón de Arrepentimiento
          </h1>

          <p className="text-sm text-pn-espresso/80 leading-relaxed font-light mb-4">
            En cumplimiento del <strong>Artículo 34 de la Ley N° 24.240</strong>, la <strong>Resolución 424/2020 SCI</strong> y la <strong>Disposición 954/2025</strong> de la Subsecretaría de Defensa del Consumidor, usted tiene el derecho irrevocable de revocar la aceptación del producto contratado online dentro del plazo legal de <strong>10 (diez) días corridos</strong> contados a partir de la entrega del bien o de la celebración del contrato.
          </p>

          <div className="bg-[#FAF7F2] border-l-2 border-pn-cognac p-4 text-xs text-pn-espresso/85 space-y-1.5 font-light">
            <p>
              • <strong>Sin autenticación obligatoria:</strong> Puede formular su revocación como invitado sin necesidad de registrarse ni iniciar sesión.
            </p>
            <p>
              • <strong>Cero costo para el consumidor:</strong> Los gastos de retiro y logística corren por cuenta de {company.legalName.value}.
            </p>
            <p>
              • <strong>Identificador Interno:</strong> Al confirmar, se generará un Identificador Único de Gestión Interna para seguimiento administrativo y constancia por correo.
            </p>
          </div>
        </div>

        {/* Formulario o Comprobante de Confirmación */}
        {submitted && claimResponse ? (
          <div className="bg-white border border-pn-arena/60 rounded-[3px] p-8 sm:p-10 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full mb-5 border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>

            <span className="text-xs uppercase tracking-[0.2em] text-emerald-800 font-semibold block mb-1">
              Solicitud Persistida en Sistema
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pn-espresso mb-2">
              Identificador Único de Gestión Interna
            </h2>

            <div className="inline-block bg-[#FAF7F2] border-2 border-pn-cognac/50 px-6 py-3 rounded-[3px] my-3">
              <span className="font-mono text-xl sm:text-2xl font-bold text-pn-espresso tracking-wider select-all">
                {claimResponse.claimId}
              </span>
            </div>

            <p className="text-xs text-pn-espresso/70 mb-2 font-light">
              Fecha y hora de registro: {new Date(claimResponse.createdAt).toLocaleString('es-AR')}
            </p>
            <span className="inline-block text-[11px] uppercase tracking-wider font-semibold text-pn-cognac mb-6">
              Estado: PENDIENTE DE ASIGNACIÓN LOGÍSTICA
            </span>

            <div className="text-left bg-[#FAF7F2] p-5 rounded-[2px] border border-[#EFE8DE] text-xs text-pn-espresso/85 space-y-2.5 mb-8 font-light">
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-pn-cognac flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Contacto operativo en 24 hs:</strong> El operador de postventa responsable de {company.legalName.value} ha sido notificado y se comunicará a <span className="font-medium text-pn-espresso">{formData.email}</span> o teléfono <span className="font-medium text-pn-espresso">{formData.phone}</span> para coordinar el retiro gratuito del paquete en su domicilio.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-pn-cognac flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Constancia al consumidor:</strong> Se ha emitido la constancia correspondiente con este identificador único de gestión interna a su correo electrónico.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-pn-cognac flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Trazabilidad y consulta:</strong> Puede consultar el estado de su trámite en todo momento citando su identificador ante <span className="font-medium text-pn-espresso">{contact.supportEmail.value}</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-pn-espresso text-pn-espresso px-6 py-2.5 rounded-[2px] text-xs uppercase tracking-[0.14em] font-medium hover:bg-pn-crema transition-colors"
              >
                <Printer size={14} />
                Imprimir Comprobante
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-block bg-pn-espresso text-pn-crema px-8 py-2.5 rounded-[2px] text-xs uppercase tracking-[0.16em] font-medium hover:bg-pn-cognac transition-colors"
              >
                Regresar al Inicio
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm space-y-6"
          >
            <h2 className="font-serif text-xl font-bold text-pn-espresso border-b border-[#EFE8DE] pb-3">
              Datos de la Solicitud de Revocación
            </h2>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-[2px] font-light">
                {errorMessage}
              </div>
            )}

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
                  value={formData.dniOrCuit}
                  onChange={(e) => setFormData({ ...formData, dniOrCuit: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                  Correo Electrónico de Notificación *
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
                  Fecha de Entrega del Producto *
                </label>
                <input
                  type="date"
                  required
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                Detalle de los Artículos a Revocar *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Indique las piezas específicas que desea devolver (ej: Montura Criolla SKU-CRI-001)"
                value={formData.productsToRevoke}
                onChange={(e) => setFormData({ ...formData, productsToRevoke: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                Motivo de la Decisión (Opcional - Ley 24.240 no exige causa)
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
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-1 h-4 w-4 text-pn-cognac border-gray-300 rounded focus:ring-pn-cognac"
                />
                <span className="text-xs text-pn-espresso/80 font-light leading-relaxed">
                  Declaro bajo fe de juramento que la presente revocación se efectúa dentro de los 10 días corridos de recibido el producto y que el bien se pone a disposición en las mismas condiciones en que fue entregado.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#EFE8DE] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-pn-espresso/60 font-light">
                * Campos obligatorios para la asignación del identificador de gestión
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-pn-espresso text-pn-crema px-8 py-3 rounded-[2px] text-xs uppercase tracking-[0.16em] font-medium hover:bg-pn-cognac transition-colors disabled:opacity-50"
              >
                {submitting ? 'Registrando en Sistema...' : 'Confirmar y Obtener Identificador de Gestión'}
              </button>
            </div>
          </form>
        )}

        {/* Nota Legal Regulatoria de Descargo */}
        <div className="mt-8 text-center text-[11px] text-pn-espresso/60 font-light leading-relaxed">
          <p>
            {company.brandName.value} · Unidad Minorista de {company.legalName.value}.
            <br />
            Los textos de esta sección constituyen un modelo de implementación regulatoria sujeto a homologación formal por la asesoría letrada de {company.legalName.value}.
            <br />
            Para información oficial de derechos del consumidor, visite{' '}
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
