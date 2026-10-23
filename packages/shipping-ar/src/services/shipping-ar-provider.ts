/**
 * WOLFIM Commerce Core — Argentine Shipping Fulfillment Provider (Medusa 2.21.2)
 * Extends AbstractFulfillmentProviderService with zone calculation and store pickup
 */
import { AbstractFulfillmentProviderService } from '@medusajs/framework/utils'
import type { CalculatedShippingOptionPrice } from '@medusajs/types'
import type { ShippingArProviderOptions } from '../types/index.js'
import { ArgentineShippingCalculator } from '../calculator/shipping-calculator.js'
import { parseArgentinePostalCode } from '../utils/postal-code.js'

export class ArgentineShippingProviderService extends AbstractFulfillmentProviderService {
  static identifier = 'shipping-ar'

  protected readonly options_: ShippingArProviderOptions
  protected readonly calculator_: ArgentineShippingCalculator

  constructor(container?: any, options: ShippingArProviderOptions = {}) {
    super()
    this.options_ = options
    this.calculator_ = new ArgentineShippingCalculator(options)
  }

  /**
   * Retrieves fulfillment options supported by this provider
   */
  async getFulfillmentOptions(): Promise<any[]> {
    return [
      {
        id: 'shipping-ar-pickup',
        name: this.options_.pickupTitle || 'Retiro en Taller / Local (Sin Cargo)',
        is_return: false,
      },
      {
        id: 'shipping-ar-delivery',
        name: 'Envío a Domicilio por Zona (Argentina)',
        is_return: false,
      },
    ]
  }

  /**
   * Validates option configuration
   */
  async validateOption(data: any): Promise<boolean> {
    return Boolean(data && (data.id === 'shipping-ar-pickup' || data.id === 'shipping-ar-delivery'))
  }

  /**
   * Validates fulfillment data (postal code, address)
   */
  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any
  ): Promise<any> {
    const isPickup = optionData?.id === 'shipping-ar-pickup' || data?.is_pickup

    if (isPickup) {
      return {
        ...data,
        is_pickup: true,
        pickup_address: this.options_.pickupAddress || 'Av. Alvear 1850, CABA',
      }
    }

    const postalCode =
      data?.postal_code ||
      context?.shipping_address?.postal_code ||
      context?.cart?.shipping_address?.postal_code

    if (postalCode) {
      const parsed = parseArgentinePostalCode(postalCode)
      if (!parsed.isValid) {
        throw new Error(
          `Código postal argentino inválido: "${postalCode}". Ingrese 4 dígitos o CPA (8 caracteres).`
        )
      }
    }

    return {
      ...data,
      is_pickup: false,
    }
  }

  /**
   * Returns whether this provider can dynamically calculate the price
   */
  async canCalculate(data: any): Promise<boolean> {
    return true
  }

  /**
   * Authoritatively computes shipping price on backend based on cart and postal code
   */
  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: any
  ): Promise<CalculatedShippingOptionPrice> {
    const isPickup = optionData?.id === 'shipping-ar-pickup' || data?.is_pickup
    if (isPickup) {
      return {
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: true,
      }
    }

    const postalCode =
      (data?.postal_code as string) ||
      context?.shipping_address?.postal_code ||
      context?.cart?.shipping_address?.postal_code ||
      '1000'

    const province =
      (data?.province as string) ||
      context?.shipping_address?.province ||
      context?.cart?.shipping_address?.province

    const cartSubtotal = Number(
      context?.cart?.subtotal ??
        context?.subtotal ??
        context?.cart?.total ??
        0
    )

    const quotes = this.calculator_.calculateQuotes({
      postalCode,
      province,
      cartSubtotal,
      isPickup: false,
    })

    const deliveryQuote = quotes.find((q) => q.optionId !== 'shipping_pickup_local')
    const finalAmount = deliveryQuote ? deliveryQuote.amount : (this.options_.defaultNationalRate || 14500)

    return {
      calculated_amount: finalAmount,
      is_calculated_price_tax_inclusive: true,
    }
  }

  /**
   * Creates fulfillment tracking metadata
   */
  async createFulfillment(
    data: any,
    items: any,
    order: any,
    fulfillment: any
  ): Promise<any> {
    const isPickup = data?.is_pickup || fulfillment?.shipping_option?.data?.id === 'shipping-ar-pickup'

    return {
      data: {
        ...data,
        tracking_number: isPickup ? 'PICKUP-LOCAL' : `AR-ENV-${Date.now()}`,
        carrier: isPickup ? 'Retiro en Local' : 'Logística Nacional AR',
        dispatched_at: new Date().toISOString(),
      },
    }
  }

  /**
   * Cancels fulfillment
   */
  async cancelFulfillment(data: any): Promise<any> {
    return {
      canceled: true,
      canceled_at: new Date().toISOString(),
    }
  }

  /**
   * Exposes calculator for testing or custom modules
   */
  public getCalculator(): ArgentineShippingCalculator {
    return this.calculator_
  }
}
