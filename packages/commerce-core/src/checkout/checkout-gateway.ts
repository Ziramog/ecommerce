/**
 * WOLFIM Commerce Core — Checkout Gateway & Validation Helpers
 * Generic validations for Argentine commerce compliance (DNI/CUIT, Postal Codes, Addresses).
 */
import type { CommerceAddress, CommerceCustomerInput } from '../types'

export interface CheckoutValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Validates customer contact step inputs
 */
export function validateCustomerContact(input: Partial<CommerceCustomerInput>): CheckoutValidationResult {
  const errors: Record<string, string> = {}

  if (!input.email || !input.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'El formato del correo electrónico es inválido'
  }

  if (input.documentId) {
    const cleaned = input.documentId.replace(/\D/g, '')
    if (cleaned.length < 7 || cleaned.length > 11) {
      errors.documentId = 'El DNI o CUIT debe tener entre 7 y 11 dígitos numéricos'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validates shipping address in Argentina
 */
export function validateShippingAddress(address: Partial<CommerceAddress>): CheckoutValidationResult {
  const errors: Record<string, string> = {}

  if (!address.firstName || !address.firstName.trim()) {
    errors.firstName = 'El nombre es obligatorio'
  }

  if (!address.lastName || !address.lastName.trim()) {
    errors.lastName = 'El apellido es obligatorio'
  }

  if (!address.address1 || !address.address1.trim()) {
    errors.address1 = 'La calle y número son obligatorios'
  }

  if (!address.city || !address.city.trim()) {
    errors.city = 'La localidad / ciudad es obligatoria'
  }

  if (!address.province || !address.province.trim()) {
    errors.province = 'La provincia es obligatoria'
  }

  if (!address.postalCode || !address.postalCode.trim()) {
    errors.postalCode = 'El código postal es obligatorio'
  } else {
    const cp = address.postalCode.trim().toUpperCase()
    // Supports 4 digits (e.g. 1425) or CPA 8 chars (e.g. C1425BND)
    const isStandard4Digit = /^\d{4}$/.test(cp)
    const isCPA8Char = /^[A-Z]\d{4}[A-Z]{3}$/.test(cp)
    if (!isStandard4Digit && !isCPA8Char) {
      errors.postalCode = 'Código postal inválido (use 4 dígitos ej: 1425 o CPA ej: C1425ABC)'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
