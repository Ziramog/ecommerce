/**
 * WOLFIM Commerce Core — Argentine Shipping Calculator Engine
 * Calculates authoritative server-side quotes by postal code and zone
 */
import type {
  ArgentineShippingZone,
  ShippingRateCalculationInput,
  ShippingRateQuote,
  ShippingArProviderOptions,
} from '../types/index.js'
import { parseArgentinePostalCode, CPA_PROVINCE_LETTER_MAP } from '../utils/postal-code.js'
import { DEFAULT_ARGENTINE_ZONES } from '../config/default-zones.js'

export class ArgentineShippingCalculator {
  private readonly zones: ArgentineShippingZone[]
  private readonly enablePickup: boolean
  private readonly pickupAddress: string
  private readonly pickupTitle: string
  private readonly globalFreeThreshold?: number
  private readonly defaultNationalRate: number

  constructor(options?: ShippingArProviderOptions) {
    this.zones = options?.zones || DEFAULT_ARGENTINE_ZONES
    this.enablePickup = options?.enablePickup ?? true
    this.pickupAddress =
      options?.pickupAddress || 'Av. Alvear 1850, Recoleta, CABA'
    this.pickupTitle =
      options?.pickupTitle || 'Retiro en Taller / Local (Sin Cargo)'
    this.globalFreeThreshold = options?.globalFreeShippingThreshold
    this.defaultNationalRate = options?.defaultNationalRate || 14500
  }

  /**
   * Resolves the matching Argentine shipping zone for a postal code and/or province
   */
  public resolveZone(postalCode?: string, province?: string): ArgentineShippingZone | null {
    if (postalCode) {
      const parsed = parseArgentinePostalCode(postalCode)
      if (parsed.isValid && parsed.numericCode) {
        const num = parsed.numericCode
        const match = this.zones.find(
          (z) =>
            z.minPostalCode !== undefined &&
            z.maxPostalCode !== undefined &&
            num >= z.minPostalCode &&
            num <= z.maxPostalCode
        )
        if (match) return match
      }

      // If province letter is present in CPA
      if (parsed.provinceLetter) {
        const provName = CPA_PROVINCE_LETTER_MAP[parsed.provinceLetter]
        if (provName) {
          const matchByLetter = this.zones.find((z) =>
            z.provinces.some((p) => p.toLowerCase() === provName.toLowerCase())
          )
          if (matchByLetter) return matchByLetter
        }
      }
    }

    if (province) {
      const provLower = province.trim().toLowerCase()
      const match = this.zones.find((z) =>
        z.provinces.some((p) => p.toLowerCase() === provLower)
      )
      if (match) return match
    }

    return null
  }

  /**
   * Calculates quotes for a cart input
   */
  public calculateQuotes(input: ShippingRateCalculationInput): ShippingRateQuote[] {
    const quotes: ShippingRateQuote[] = []

    // 1. Pickup Option (if enabled)
    if (this.enablePickup) {
      quotes.push({
        optionId: 'shipping_pickup_local',
        name: this.pickupTitle,
        amount: 0,
        currencyCode: 'ARS',
        estimatedDaysMin: 0,
        estimatedDaysMax: 1,
        isFree: true,
        description: `Retiro gratuito en: ${this.pickupAddress}`,
      })
    }

    // If only pickup requested
    if (input.isPickup) {
      return quotes
    }

    // 2. Delivery Option
    const zone = this.resolveZone(input.postalCode, input.province)
    let baseAmount = zone ? zone.baseRate : this.defaultNationalRate
    let daysMin = zone ? zone.estimatedDaysMin : 4
    let daysMax = zone ? zone.estimatedDaysMax : 8
    const zoneName = zone ? zone.name : 'Envío Nacional Estándar'

    // Free shipping threshold check (zone threshold or global threshold)
    const threshold =
      zone?.freeShippingThreshold ?? this.globalFreeThreshold ?? 200000
    const isFree = input.cartSubtotal >= threshold

    let finalAmount = isFree ? 0 : baseAmount

    // Optional weight surcharge (> 10kg)
    if (!isFree && input.totalWeightKg && input.totalWeightKg > 10) {
      const extraKg = Math.ceil(input.totalWeightKg - 10)
      finalAmount += extraKg * 500
    }

    quotes.push({
      optionId: zone ? `shipping_delivery_${zone.id}` : 'shipping_delivery_national',
      name: isFree
        ? `Envío a Domicilio (${zoneName}) — ¡Gratis!`
        : `Envío a Domicilio (${zoneName})`,
      amount: finalAmount,
      currencyCode: 'ARS',
      estimatedDaysMin: daysMin,
      estimatedDaysMax: daysMax,
      isFree,
      zoneId: zone?.id,
      description: isFree
        ? `Envío bonificado por compras superiores a $${threshold.toLocaleString('es-AR')}`
        : `Entrega estimada en ${daysMin} a ${daysMax} días hábiles`,
    })

    return quotes
  }
}
