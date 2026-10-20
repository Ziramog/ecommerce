'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { formatCUIT, validateCUIT } from '@/lib/utils'
import { Building, FileText, CheckCircle2 } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const { registerCommercialAccount } = useAuthB2B()

  const [companyName, setCompanyName] = useState('')
  const [cuit, setCuit] = useState('')
  const [conditionIVA, setConditionIVA] = useState('Responsable Inscripto')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('Buenos Aires')
  const [city, setCity] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCuit(formatCUIT(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName || !cuit || !email || !phone || !city) {
      setError('Por favor complete todos los campos obligatorios.')
      return
    }

    if (!validateCUIT(cuit)) {
      setError('El CUIT ingresado no es válido (verifique los 11 dígitos y el dígito verificador).')
      return
    }

    setError(null)
    await registerCommercialAccount({
      companyName,
      cuit,
      conditionIVA,
      email,
      phone,
      province,
      city,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-lg border border-emerald-200 shadow-sm text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="font-heading text-xl font-bold text-navy mb-2 uppercase">
          Solicitud de Cuenta Comercial Recibida
        </h3>
        <p className="text-xs text-b2b-600 mb-4 leading-relaxed max-w-md mx-auto">
          Hemos registrado la solicitud para <strong>{companyName}</strong> (CUIT {cuit}). Su cuenta se encuentra en proceso de validación fiscal por la mesa comercial de Talabartería Mercadal.
        </p>
        <p className="text-xs text-b2b-500 mb-6">
          Puede explorar el catálogo mayorista y simular solicitudes de cotización (RFQ) de forma inmediata.
        </p>
        <button
          onClick={() => router.push('/catalogo')}
          className="py-2.5 px-6 bg-navy hover:bg-navy-light text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
        >
          Explorar Catálogo Mayorista
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-b2b-200 shadow-sm">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold text-navy mb-1 uppercase tracking-wider">
          Apertura de Cuenta Comercial B2B
        </h2>
        <p className="text-xs text-b2b-500">
          Complete los datos fiscales y comerciales de su negocio para habilitar pedidos mayoristas y facturación directa.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-b2b-700 mb-1">
              Razón Social / Nombre Comercial *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-b2b-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Talabartería del Sur S.R.L."
                className="w-full pl-9 pr-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-b2b-700 mb-1">
              CUIT (11 dígitos) *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-b2b-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={cuit}
                onChange={handleCuitChange}
                placeholder="30-12345678-9"
                maxLength={13}
                className="w-full pl-9 pr-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-b2b-700 mb-1">
              Condición frente al IVA *
            </label>
            <select
              value={conditionIVA}
              onChange={(e) => setConditionIVA(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900 bg-white"
            >
              <option value="Responsable Inscripto">IVA Responsable Inscripto</option>
              <option value="Monotributo">Responsable Monotributo</option>
              <option value="Exento">IVA Exento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-b2b-700 mb-1">
              Teléfono Comercial *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(011) 4567-8901"
              className="w-full px-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-b2b-700 mb-1">
            Correo Electrónico Comercial *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="administracion@suempresa.com.ar"
            className="w-full px-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-b2b-700 mb-1">
              Provincia *
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900 bg-white"
            >
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
              <option value="Córdoba">Córdoba</option>
              <option value="Santa Fe">Santa Fe</option>
              <option value="Entre Ríos">Entre Ríos</option>
              <option value="Corrientes">Corrientes</option>
              <option value="Chaco">Chaco</option>
              <option value="La Pampa">La Pampa</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Otras">Otras Provincias</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-b2b-700 mb-1">
              Localidad / Ciudad *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="San Antonio de Areco"
              className="w-full px-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-saddle hover:bg-saddle-dark text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
        >
          Enviar Solicitud de Alta Mayorista
        </button>
      </form>
    </div>
  )
}
