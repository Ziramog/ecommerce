'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react'
import { CLIENT_COMMERCIAL_CONFIG } from '@/config/client-commercial-config'

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Consulta General',
    message: '',
  })

  const { company, contact } = CLIENT_COMMERCIAL_CONFIG

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Retorno */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-pn-cognac hover:text-pn-espresso transition-colors font-medium"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Volver a la Tienda
          </Link>
        </div>

        {/* Encabezado */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 bg-pn-crema text-pn-espresso rounded-[2px] border border-pn-arena/50">
              <MessageSquare size={22} className="text-pn-cognac" />
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-pn-cognac">
              Atención Personalizada
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pn-espresso mb-4 tracking-tight">
            Contacto & Showroom
          </h1>

          <p className="text-sm text-pn-espresso/80 leading-relaxed font-light">
            Estamos a su entera disposición para asesorarlo en la elección de piezas ecuestres, regalos de autor a medida o consultas sobre pedidos en curso.
          </p>

          {/* Aviso de Gobernanza Comercial */}
          {contact.phoneFormatted.status === 'PENDING_CLIENT_APPROVAL' && (
            <div className="mt-4 bg-amber-50/80 border border-amber-200/80 p-3 rounded-[2px] text-[11px] text-amber-900 flex items-start gap-2 font-light">
              <AlertTriangle size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aviso de homologación comercial:</strong> Las líneas de atención directa y dirección de showroom se encuentran en proceso de confirmación operativa por parte de {company.legalName.value}. Las consultas enviadas mediante este formulario son canalizadas a la casilla técnica de soporte.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Datos de Contacto y Showroom */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-pn-espresso border-b border-[#EFE8DE] pb-3">
                Canales de Atención
              </h2>

              <div className="flex items-start gap-3.5">
                <MapPin size={20} className="text-pn-cognac flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-pn-espresso mb-1">
                    Showroom & Taller Central
                  </h4>
                  <p className="text-xs text-pn-espresso/80 font-light leading-relaxed">
                    {company.showroomAddress.value}
                  </p>
                  <span className="inline-block mt-1 text-[11px] text-pn-cognac italic">
                    Visitas personalizadas con cita previa
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock size={20} className="text-pn-cognac flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-pn-espresso mb-1">
                    Horarios de Atención
                  </h4>
                  <p className="text-xs text-pn-espresso/80 font-light leading-relaxed">
                    {contact.businessHoursWeekday.value}
                    <br />
                    {contact.businessHoursSaturday.value}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone size={20} className="text-pn-cognac flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-pn-espresso mb-1">
                    Teléfono & WhatsApp
                  </h4>
                  <p className="text-xs text-pn-espresso/80 font-light leading-relaxed">
                    {contact.phoneFormatted.value}
                    <br />
                    Atención directa de especialistas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail size={20} className="text-pn-cognac flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-pn-espresso mb-1">
                    Correos Electrónicos
                  </h4>
                  <p className="text-xs text-pn-espresso/80 font-light leading-relaxed">
                    Consultas: <span className="font-medium text-pn-espresso">{contact.generalEmail.value}</span>
                    <br />
                    Soporte: <span className="font-medium text-pn-espresso">{contact.supportEmail.value}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Aviso B2B */}
            <div className="bg-pn-espresso text-pn-crema p-6 rounded-[3px] border border-pn-marron/50">
              <span className="text-[10px] uppercase tracking-[0.2em] text-pn-arena font-semibold block mb-1">
                ¿Comercio o Club Ecuestre?
              </span>
              <h4 className="font-serif text-base font-bold text-white mb-2">
                Atención Mayorista (B2B)
              </h4>
              <p className="text-xs text-pn-crema/80 font-light leading-relaxed mb-4">
                Si desea adquirir productos por escala comercial con lista de precios mayorista, acceda a nuestro portal mayorista privado.
              </p>
              <a
                href="http://localhost:3001"
                className="inline-block text-xs uppercase tracking-[0.14em] text-pn-crema hover:text-white font-medium underline underline-offset-4"
              >
                Ingresar al Portal B2B →
              </a>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-pn-espresso border-b border-[#EFE8DE] pb-3 mb-6">
                Envíenos un Mensaje
              </h2>

              {submitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-pn-espresso">
                    Mensaje Recibido
                  </h3>
                  <p className="text-xs text-pn-espresso/80 max-w-sm mx-auto font-light leading-relaxed">
                    Gracias por comunicarse con Pampa Novus. Un asesor responderá a su consulta a la brevedad.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: 'Consulta General',
                        message: '',
                      })
                    }}
                    className="mt-4 inline-block text-xs uppercase tracking-[0.16em] text-pn-cognac font-medium underline hover:text-pn-espresso"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Facundo Quiroga"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                        Correo Electrónico *
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
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="Ej: +54 9 11 5555-7267"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                      Asunto de Consulta
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                    >
                      <option value="Consulta General">Consulta General sobre Piezas</option>
                      <option value="Asesoramiento Monturas">Asesoramiento sobre Monturas y Aperos</option>
                      <option value="Estado de Pedido">Estado de un Pedido en Curso</option>
                      <option value="Cambio o Devolución">Gestión de Cambio o Devolución</option>
                      <option value="Regalo Corporativo">Regalos Corporativos de Autor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-pn-espresso font-semibold mb-1.5">
                      Mensaje o Consulta *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Escriba su mensaje detallando su consulta o requerimiento..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9C9A8] rounded-[2px] text-pn-espresso focus:border-pn-cognac outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-pn-espresso text-pn-crema py-3 px-6 rounded-[2px] text-xs uppercase tracking-[0.16em] font-medium hover:bg-pn-cognac transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    Enviar Consulta
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
