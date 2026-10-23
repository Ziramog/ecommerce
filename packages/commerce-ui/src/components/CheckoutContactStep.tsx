import React from 'react'
import type { CommerceCustomerInput } from '@mercadal/commerce-core'

export interface CheckoutContactStepProps {
  initialValues?: Partial<CommerceCustomerInput>
  onSubmit: (data: CommerceCustomerInput) => void
  isLoading?: boolean
  errors?: Record<string, string>
  className?: string
  themeClasses?: {
    input?: string
    label?: string
    button?: string
    error?: string
  }
}

export function CheckoutContactStep({
  initialValues,
  onSubmit,
  isLoading = false,
  errors = {},
  className = '',
  themeClasses = {},
}: CheckoutContactStepProps) {
  const [email, setEmail] = React.useState(initialValues?.email || '')
  const [phone, setPhone] = React.useState(initialValues?.phone || '')
  const [documentId, setDocumentId] = React.useState(initialValues?.documentId || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      email: email.trim(),
      phone: phone.trim(),
      documentId: documentId.trim(),
    })
  }

  const inputClass =
    themeClasses.input ||
    'w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-[2px] text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors'
  const labelClass = themeClasses.label || 'block text-xs font-medium uppercase tracking-wider text-neutral-700 mb-1.5'
  const buttonClass =
    themeClasses.button ||
    'w-full py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 rounded-[2px] disabled:opacity-50'
  const errorClass = themeClasses.error || 'text-xs text-red-600 mt-1 font-medium'

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} noValidate>
      <div>
        <label htmlFor="checkout-email" className={labelClass}>
          Correo Electrónico <span className="text-red-500">*</span>
        </label>
        <input
          id="checkout-email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'checkout-email-error' : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          className={inputClass}
          disabled={isLoading}
        />
        {errors.email && (
          <p id="checkout-email-error" className={errorClass} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkout-phone" className={labelClass}>
            Teléfono Móvil
          </label>
          <input
            id="checkout-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11 1234 5678"
            className={inputClass}
            disabled={isLoading}
          />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="checkout-document" className={labelClass}>
            DNI o CUIT (Facturación)
          </label>
          <input
            id="checkout-document"
            type="text"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            placeholder="38123456"
            className={inputClass}
            disabled={isLoading}
          />
          {errors.documentId && <p className={errorClass}>{errors.documentId}</p>}
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isLoading} className={buttonClass}>
          {isLoading ? 'Guardando contacto...' : 'Continuar al Domicilio de Entrega →'}
        </button>
      </div>
    </form>
  )
}
