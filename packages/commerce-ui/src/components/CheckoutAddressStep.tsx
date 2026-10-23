import React from 'react'
import type { CommerceAddress } from '@mercadal/commerce-core'

export const ARGENTINA_PROVINCES = [
  'Ciudad Autónoma de Buenos Aires',
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

export interface CheckoutAddressStepProps {
  initialValues?: Partial<CommerceAddress>
  onSubmit: (address: CommerceAddress) => void
  onBack?: () => void
  isLoading?: boolean
  errors?: Record<string, string>
  className?: string
  themeClasses?: {
    input?: string
    select?: string
    label?: string
    button?: string
    backButton?: string
    error?: string
  }
}

export function CheckoutAddressStep({
  initialValues,
  onSubmit,
  onBack,
  isLoading = false,
  errors = {},
  className = '',
  themeClasses = {},
}: CheckoutAddressStepProps) {
  const [firstName, setFirstName] = React.useState(initialValues?.firstName || '')
  const [lastName, setLastName] = React.useState(initialValues?.lastName || '')
  const [address1, setAddress1] = React.useState(initialValues?.address1 || '')
  const [address2, setAddress2] = React.useState(initialValues?.address2 || '')
  const [city, setCity] = React.useState(initialValues?.city || '')
  const [province, setProvince] = React.useState(initialValues?.province || 'Ciudad Autónoma de Buenos Aires')
  const [postalCode, setPostalCode] = React.useState(initialValues?.postalCode || '')
  const [phone, setPhone] = React.useState(initialValues?.phone || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      countryCode: 'ar',
      phone: phone.trim(),
    })
  }

  const inputClass =
    themeClasses.input ||
    'w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-[2px] text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors'
  const selectClass = themeClasses.select || inputClass
  const labelClass = themeClasses.label || 'block text-xs font-medium uppercase tracking-wider text-neutral-700 mb-1.5'
  const buttonClass =
    themeClasses.button ||
    'flex-1 py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 rounded-[2px] disabled:opacity-50'
  const backButtonClass =
    themeClasses.backButton ||
    'py-3.5 px-6 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs uppercase tracking-widest font-semibold transition-all duration-200 rounded-[2px]'
  const errorClass = themeClasses.error || 'text-xs text-red-600 mt-1 font-medium'

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="addr-firstName" className={labelClass}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            disabled={isLoading}
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="addr-lastName" className={labelClass}>
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            disabled={isLoading}
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="addr-address1" className={labelClass}>
          Calle y Número <span className="text-red-500">*</span>
        </label>
        <input
          id="addr-address1"
          type="text"
          required
          placeholder="Av. Alvear 1850"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          className={inputClass}
          disabled={isLoading}
        />
        {errors.address1 && <p className={errorClass}>{errors.address1}</p>}
      </div>

      <div>
        <label htmlFor="addr-address2" className={labelClass}>
          Piso, Departamento o Datos Adicionales (Opcional)
        </label>
        <input
          id="addr-address2"
          type="text"
          placeholder="Piso 4, Dpto B"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="addr-postalCode" className={labelClass}>
            Código Postal <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-postalCode"
            type="text"
            required
            placeholder="1425 o C1425BND"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className={inputClass}
            disabled={isLoading}
          />
          {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
        </div>

        <div>
          <label htmlFor="addr-city" className={labelClass}>
            Localidad / Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            disabled={isLoading}
          />
          {errors.city && <p className={errorClass}>{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="addr-province" className={labelClass}>
            Provincia <span className="text-red-500">*</span>
          </label>
          <select
            id="addr-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={selectClass}
            disabled={isLoading}
          >
            {ARGENTINA_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.province && <p className={errorClass}>{errors.province}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-3">
        {onBack && (
          <button type="button" onClick={onBack} disabled={isLoading} className={backButtonClass}>
            ← Volver
          </button>
        )}
        <button type="submit" disabled={isLoading} className={buttonClass}>
          {isLoading ? 'Guardando domicilio...' : 'Continuar al Método de Envío →'}
        </button>
      </div>
    </form>
  )
}
