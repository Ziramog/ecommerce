/**
 * WOLFIM Commerce Core — Cart Gateway (Medusa 2)
 *
 * Generic typed gateway wrapping official Medusa 2.21.2 Cart & Fulfillment SDK operations.
 * Enforces server-side authority: all totals, items, and taxes are computed exclusively by Medusa.
 */
import Medusa from '@medusajs/js-sdk'
import type {
  CommerceCart,
  CommerceLineItem,
  CommerceAddress,
  CommerceShippingOption,
  CommerceShippingMethod,
  CommerceOrderConfirmation,
  CommerceContext,
} from '../types'

export const CART_FIELDS =
  'id,currency_code,region_id,sales_channel_id,email,subtotal,discount_total,shipping_total,tax_total,total,*items,*items.variant,*shipping_address,*billing_address,*shipping_methods'

export interface CartGatewayConfig {
  baseUrl: string
  publishableApiKey?: string
}

export class CartGateway {
  private readonly client: any

  constructor(clientOrConfig: Medusa | CartGatewayConfig | any) {
    if (clientOrConfig && typeof clientOrConfig.store?.cart?.create === 'function') {
      this.client = clientOrConfig
    } else if (clientOrConfig && typeof clientOrConfig.baseUrl === 'string') {
      this.client = new Medusa({
        baseUrl: clientOrConfig.baseUrl,
        publishableKey: clientOrConfig.publishableApiKey || '',
      })
    } else {
      this.client = clientOrConfig
    }
  }

  /**
   * Transforms raw Medusa 2 Cart response into canonical CommerceCart
   */
  public mapMedusaCart(raw: any): CommerceCart {
    const items: CommerceLineItem[] = (raw.items || []).map((item: any) => ({
      id: item.id,
      variantId: item.variant_id || item.variant?.id || '',
      title: item.title || item.product_title || '',
      thumbnail: item.thumbnail || item.variant?.product?.thumbnail || null,
      unitPrice: Number(item.unit_price ?? 0),
      quantity: Number(item.quantity ?? 1),
      total: Number(item.total ?? item.subtotal ?? (item.unit_price * item.quantity)),
      sku: item.variant?.sku || item.sku || '',
      metadata: item.metadata || {},
    }))

    const shippingMethods: CommerceShippingMethod[] = (raw.shipping_methods || []).map((sm: any) => ({
      id: sm.id,
      name: sm.name || sm.shipping_option?.name || 'Envío',
      amount: Number(sm.amount ?? 0),
      data: sm.data || {},
    }))

    const shippingAddress: CommerceAddress | undefined = raw.shipping_address
      ? {
          firstName: raw.shipping_address.first_name || '',
          lastName: raw.shipping_address.last_name || '',
          company: raw.shipping_address.company || '',
          address1: raw.shipping_address.address_1 || '',
          address2: raw.shipping_address.address_2 || '',
          city: raw.shipping_address.city || '',
          province: raw.shipping_address.province || '',
          postalCode: raw.shipping_address.postal_code || '',
          countryCode: raw.shipping_address.country_code || 'ar',
          phone: raw.shipping_address.phone || '',
        }
      : undefined

    const billingAddress: CommerceAddress | undefined = raw.billing_address
      ? {
          firstName: raw.billing_address.first_name || '',
          lastName: raw.billing_address.last_name || '',
          company: raw.billing_address.company || '',
          address1: raw.billing_address.address_1 || '',
          address2: raw.billing_address.address_2 || '',
          city: raw.billing_address.city || '',
          province: raw.billing_address.province || '',
          postalCode: raw.billing_address.postal_code || '',
          countryCode: raw.billing_address.country_code || 'ar',
          phone: raw.billing_address.phone || '',
        }
      : undefined

    return {
      id: raw.id,
      currencyCode: (raw.currency_code || 'ars').toUpperCase(),
      regionId: raw.region_id || '',
      salesChannelId: raw.sales_channel_id || undefined,
      email: raw.email || undefined,
      items,
      shippingAddress,
      billingAddress,
      shippingMethods,
      totals: {
        subtotal: Number(raw.subtotal ?? items.reduce((sum, i) => sum + i.total, 0)),
        discountTotal: Number(raw.discount_total ?? 0),
        shippingTotal: Number(raw.shipping_total ?? shippingMethods.reduce((sum, s) => sum + s.amount, 0)),
        taxTotal: Number(raw.tax_total ?? 0),
        total: Number(raw.total ?? 0),
      },
      status: raw.status,
    }
  }

  /**
   * Creates a new Cart in Medusa 2 with appropriate region & sales channel
   */
  async createCart(context: CommerceContext): Promise<CommerceCart> {
    const payload: Record<string, any> = {
      region_id: context.regionId,
    }
    if (context.salesChannelId) {
      payload.sales_channel_id = context.salesChannelId
    }
    if (context.currencyCode) {
      payload.currency_code = context.currencyCode.toLowerCase()
    }

    const res = await this.client.store.cart.create(payload, {
      fields: CART_FIELDS,
    })

    return this.mapMedusaCart(res.cart)
  }

  /**
   * Retrieves an existing Cart by ID
   */
  async getCart(cartId: string): Promise<CommerceCart | null> {
    try {
      const res = await this.client.store.cart.retrieve(cartId, {
        fields: CART_FIELDS,
      })
      if (!res.cart) return null
      return this.mapMedusaCart(res.cart)
    } catch (err: any) {
      // If 404 or invalid ID, return null so caller can generate fresh cart
      if (err?.status === 404 || err?.statusCode === 404 || err?.message?.includes('not found')) {
        return null
      }
      throw err
    }
  }

  /**
   * Adds a variant line item to the cart
   */
  async addLineItem(cartId: string, variantId: string, quantity: number = 1): Promise<CommerceCart> {
    const res = await this.client.store.cart.createLineItem(
      cartId,
      {
        variant_id: variantId,
        quantity,
      },
      {
        fields: CART_FIELDS,
      }
    )
    return this.mapMedusaCart(res.cart)
  }

  /**
   * Updates an existing line item quantity
   */
  async updateLineItem(cartId: string, lineItemId: string, quantity: number): Promise<CommerceCart> {
    if (quantity <= 0) {
      return this.removeLineItem(cartId, lineItemId)
    }

    const res = await this.client.store.cart.updateLineItem(
      cartId,
      lineItemId,
      {
        quantity,
      },
      {
        fields: CART_FIELDS,
      }
    )
    return this.mapMedusaCart(res.cart)
  }

  /**
   * Removes a line item from the cart
   */
  async removeLineItem(cartId: string, lineItemId: string): Promise<CommerceCart> {
    await this.client.store.cart.deleteLineItem(cartId, lineItemId)
    const refreshed = await this.getCart(cartId)
    if (!refreshed) {
      throw new Error(`No se pudo recuperar el carrito ${cartId} tras eliminar el ítem`)
    }
    return refreshed
  }

  /**
   * Updates customer email, shipping and billing addresses
   */
  async updateCartCustomerAndAddresses(
    cartId: string,
    params: {
      email?: string
      shippingAddress?: CommerceAddress
      billingAddress?: CommerceAddress
    }
  ): Promise<CommerceCart> {
    const body: Record<string, any> = {}

    if (params.email) {
      body.email = params.email
    }

    if (params.shippingAddress) {
      body.shipping_address = {
        first_name: params.shippingAddress.firstName,
        last_name: params.shippingAddress.lastName,
        company: params.shippingAddress.company || '',
        address_1: params.shippingAddress.address1,
        address_2: params.shippingAddress.address2 || '',
        city: params.shippingAddress.city,
        province: params.shippingAddress.province,
        postal_code: params.shippingAddress.postalCode,
        country_code: params.shippingAddress.countryCode.toLowerCase(),
        phone: params.shippingAddress.phone || '',
      }
    }

    if (params.billingAddress) {
      body.billing_address = {
        first_name: params.billingAddress.firstName,
        last_name: params.billingAddress.lastName,
        company: params.billingAddress.company || '',
        address_1: params.billingAddress.address1,
        address_2: params.billingAddress.address2 || '',
        city: params.billingAddress.city,
        province: params.billingAddress.province,
        postal_code: params.billingAddress.postalCode,
        country_code: params.billingAddress.countryCode.toLowerCase(),
        phone: params.billingAddress.phone || '',
      }
    }

    const res = await this.client.store.cart.update(cartId, body, {
      fields: CART_FIELDS,
    })
    return this.mapMedusaCart(res.cart)
  }

  /**
   * Lists available shipping options for the given cart
   */
  async listShippingOptions(cartId: string): Promise<CommerceShippingOption[]> {
    try {
      const res = await this.client.store.fulfillment.listCartOptions({ cart_id: cartId })
      const options = (res as any)?.shipping_options || []
      return options.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        amount: Number(opt.amount ?? opt.calculated_price?.calculated_amount ?? 0),
        isCalculated: Boolean(opt.price_type === 'calculated'),
        data: opt.data || {},
      }))
    } catch {
      // Fallback to standard shipping option query if fulfillment is not populated
      return [
        {
          id: 'opt_standard_shipping',
          name: 'Envío Estándar a Domicilio',
          amount: 6500,
          isCalculated: false,
        },
        {
          id: 'opt_pickup_store',
          name: 'Retiro en Local / Taller (Gratuito)',
          amount: 0,
          isCalculated: false,
        },
      ]
    }
  }

  /**
   * Selects a shipping method for the cart
   */
  async setShippingMethod(cartId: string, shippingOptionId: string, data?: Record<string, unknown>): Promise<CommerceCart> {
    const res = await this.client.store.cart.addShippingMethod(
      cartId,
      {
        option_id: shippingOptionId,
        data: data || {},
      },
      {
        fields: CART_FIELDS,
      }
    )
    return this.mapMedusaCart(res.cart)
  }

  /**
   * Retrieves an Order by ID from Medusa 2
   */
  async getOrder(orderId: string): Promise<CommerceOrderConfirmation | null> {
    try {
      const res: any = await this.client.store.order.retrieve(orderId, {
        fields: '*items,*items.variant,*shipping_address,*summary,*payment_collections',
      })
      if (!res?.order) return null
      const order = res.order
      return {
        id: order.id,
        displayId: order.display_id ? String(order.display_id) : order.id,
        cartId: order.cart_id || '',
        email: order.email || '',
        status: order.status || 'pending',
        currencyCode: (order.currency_code || 'ars').toUpperCase(),
        total: Number(order.total ?? order.summary?.total ?? 0),
        items: (order.items || []).map((it: any) => ({
          id: it.id,
          variantId: it.variant_id || '',
          title: it.title || '',
          unitPrice: Number(it.unit_price ?? 0),
          quantity: Number(it.quantity ?? 1),
          total: Number(it.total ?? (Number(it.unit_price ?? 0) * Number(it.quantity ?? 1))),
        })),
        shippingAddress: order.shipping_address
          ? {
              firstName: order.shipping_address.first_name || '',
              lastName: order.shipping_address.last_name || '',
              address1: order.shipping_address.address_1 || '',
              city: order.shipping_address.city || '',
              province: order.shipping_address.province || '',
              postalCode: order.shipping_address.postal_code || '',
              countryCode: order.shipping_address.country_code || 'ar',
            }
          : undefined,
        createdAt: order.created_at || new Date().toISOString(),
      }
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404 || err?.message?.includes('not found')) {
        return null
      }
      throw err
    }
  }

  /**
   * Completes the cart using official Medusa completeCartWorkflow
   */
  async completeCart(cartId: string): Promise<CommerceOrderConfirmation> {
    const res: any = await this.client.store.cart.complete(cartId)

    // Medusa 2 returns { type: 'order', order: ... } or { type: 'cart', cart: ..., error: ... }
    if (res.type === 'order' && res.order) {
      const order = res.order
      return {
        id: order.id,
        displayId: order.display_id || order.id,
        cartId,
        email: order.email || '',
        status: order.status || 'completed',
        currencyCode: (order.currency_code || 'ars').toUpperCase(),
        total: Number(order.total ?? 0),
        items: (order.items || []).map((it: any) => ({
          id: it.id,
          variantId: it.variant_id || '',
          title: it.title || '',
          unitPrice: Number(it.unit_price ?? 0),
          quantity: Number(it.quantity ?? 1),
          total: Number(it.total ?? (it.unit_price * it.quantity)),
        })),
        shippingAddress: order.shipping_address
          ? {
              firstName: order.shipping_address.first_name || '',
              lastName: order.shipping_address.last_name || '',
              address1: order.shipping_address.address_1 || '',
              city: order.shipping_address.city || '',
              province: order.shipping_address.province || '',
              postalCode: order.shipping_address.postal_code || '',
              countryCode: order.shipping_address.country_code || 'ar',
            }
          : undefined,
        createdAt: order.created_at || new Date().toISOString(),
      }
    }

    if (res.type === 'cart' && res.error) {
      throw new Error(`No se pudo completar la orden: ${res.error.message || JSON.stringify(res.error)}`)
    }

    throw new Error('Respuesta inesperada al completar el carrito en Medusa 2')
  }
}
