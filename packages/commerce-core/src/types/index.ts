/**
 * WOLFIM Commerce Core — Canonical Domain Types
 * Generic contracts for Cart, LineItems, Addresses, and Checkout operations.
 * Zero references to specific brands, logos, or client-specific configurations.
 */

export interface CommerceAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  countryCode: string
  phone?: string
}

export interface CommerceCustomerInput {
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  documentId?: string // CUIT/CUIL/DNI for Argentine compliance
}

export interface CommerceLineItem {
  id: string
  variantId: string
  title: string
  thumbnail?: string | null
  unitPrice: number
  quantity: number
  total: number
  sku?: string
  metadata?: Record<string, unknown>
}

export interface CommerceShippingMethod {
  id: string
  name: string
  amount: number
  data?: Record<string, unknown>
}

export interface CommerceCartTotals {
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
}

export interface CommerceCart {
  id: string
  currencyCode: string
  regionId: string
  salesChannelId?: string
  email?: string
  items: CommerceLineItem[]
  shippingAddress?: CommerceAddress
  billingAddress?: CommerceAddress
  shippingMethods: CommerceShippingMethod[]
  totals: CommerceCartTotals
  status?: string
}

export interface CommerceShippingOption {
  id: string
  name: string
  amount: number
  isCalculated: boolean
  data?: Record<string, unknown>
}

export interface CommerceOrderConfirmation {
  id: string
  displayId?: string | number
  cartId: string
  email: string
  status: string
  currencyCode: string
  total: number
  items: CommerceLineItem[]
  shippingAddress?: CommerceAddress
  createdAt: string
}

export interface CommerceContext {
  regionId: string
  salesChannelId?: string
  currencyCode?: string
}
