/**
 * WOLFIM Commerce Core — Argentine Shipping Adapter Types
 */

export interface ArgentineShippingZone {
  id: string
  name: string
  description?: string
  provinces: string[]
  minPostalCode?: number
  maxPostalCode?: number
  baseRate: number
  estimatedDaysMin: number
  estimatedDaysMax: number
  freeShippingThreshold?: number
}

export interface ShippingRateCalculationInput {
  postalCode?: string
  province?: string
  cartSubtotal: number
  totalWeightKg?: number
  isPickup?: boolean
}

export interface ShippingRateQuote {
  optionId: string
  name: string
  amount: number
  currencyCode: 'ARS'
  estimatedDaysMin: number
  estimatedDaysMax: number
  isFree: boolean
  zoneId?: string
  description?: string
}

export interface ShippingArProviderOptions {
  zones?: ArgentineShippingZone[]
  enablePickup?: boolean
  pickupAddress?: string
  pickupTitle?: string
  globalFreeShippingThreshold?: number
  defaultNationalRate?: number
}
