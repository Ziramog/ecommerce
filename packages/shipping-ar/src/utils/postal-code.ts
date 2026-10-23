/**
 * WOLFIM Commerce Core — Argentine Postal Code Normalizer & Validator
 */

const CPA_REGEX = /^[A-Z]\d{4}[A-Z]{3}$/i
const NUMERIC_CP_REGEX = /^\d{4}$/

export interface ParsedPostalCode {
  isValid: boolean
  original: string
  normalized: string
  numericCode?: number
  provinceLetter?: string
}

/**
 * Normalizes and extracts numeric postal code from traditional (4-digit) or CPA (8-char) formats
 */
export function parseArgentinePostalCode(postalCode: string): ParsedPostalCode {
  if (!postalCode) {
    return { isValid: false, original: '', normalized: '' }
  }

  const trimmed = postalCode.trim().toUpperCase()

  // Case 1: Traditional 4-digit code (e.g., "1425")
  if (NUMERIC_CP_REGEX.test(trimmed)) {
    const num = parseInt(trimmed, 10)
    return {
      isValid: true,
      original: postalCode,
      normalized: trimmed,
      numericCode: num,
    }
  }

  // Case 2: CPA format (e.g., "C1425BND")
  if (CPA_REGEX.test(trimmed)) {
    const provinceLetter = trimmed[0]
    const numericPart = trimmed.substring(1, 5)
    const num = parseInt(numericPart, 10)
    return {
      isValid: true,
      original: postalCode,
      normalized: trimmed,
      numericCode: num,
      provinceLetter,
    }
  }

  return {
    isValid: false,
    original: postalCode,
    normalized: trimmed,
  }
}

/**
 * Letter map for ISO 3166-2:AR / CPA province letters
 */
export const CPA_PROVINCE_LETTER_MAP: Record<string, string> = {
  C: 'Ciudad Autónoma de Buenos Aires',
  B: 'Buenos Aires',
  K: 'Catamarca',
  H: 'Chaco',
  U: 'Chubut',
  X: 'Córdoba',
  W: 'Corrientes',
  E: 'Entre Ríos',
  P: 'Formosa',
  Y: 'Jujuy',
  L: 'La Pampa',
  F: 'La Rioja',
  M: 'Mendoza',
  N: 'Misiones',
  Q: 'Neuquén',
  R: 'Río Negro',
  A: 'Salta',
  J: 'San Juan',
  D: 'San Luis',
  Z: 'Santa Cruz',
  S: 'Santa Fe',
  G: 'Santiago del Estero',
  V: 'Tierra del Fuego',
  T: 'Tucumán',
}
