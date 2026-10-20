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

export function formatInstallments(amount: number, installments: number = 3): string {
  const installmentAmount = Math.round(amount / installments)
  return `${installments} cuotas fijas de ${formatCurrencyARS(installmentAmount)}`
}
