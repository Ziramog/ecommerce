import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea un CUIT numérico a formato XX-XXXXXXXX-X
 */
export function formatCUIT(cuit: string): string {
  const clean = cuit.replace(/\D/g, '').slice(0, 11)
  if (clean.length <= 2) return clean
  if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2)}`
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10, 11)}`
}

/**
 * Validador oficial de CUIT argentino mediante algoritmo Módulo 11
 */
export function validateCUIT(cuit: string): boolean {
  const clean = cuit.replace(/\D/g, '')
  if (clean.length !== 11) return false

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0

  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i], 10) * multipliers[i]
  }

  const remainder = sum % 11
  let checkDigit = 11 - remainder
  if (checkDigit === 11) checkDigit = 0
  if (checkDigit === 10) checkDigit = 9

  return checkDigit === parseInt(clean[10], 10)
}

export interface VolumeTier {
  minQty: number
  discountPercent: number
  label: string
}

export const DEFAULT_VOLUME_TIERS: VolumeTier[] = [
  { minQty: 1, discountPercent: 0, label: '1 - 4 un.' },
  { minQty: 5, discountPercent: 10, label: '5 - 9 un. (-10%)' },
  { minQty: 10, discountPercent: 20, label: '10+ un. (-20%)' },
]

export function calculateVolumeDiscount(
  unitPrice: number,
  quantity: number,
  tiers: VolumeTier[] = DEFAULT_VOLUME_TIERS
): { unitPrice: number; discountPercent: number; totalPrice: number } {
  let applicableTier = tiers[0]

  for (const tier of tiers) {
    if (quantity >= tier.minQty) {
      applicableTier = tier
    }
  }

  const discountedUnit = Math.round(unitPrice * (1 - applicableTier.discountPercent / 100))
  const total = discountedUnit * quantity

  return {
    unitPrice: discountedUnit,
    discountPercent: applicableTier.discountPercent,
    totalPrice: total,
  }
}
