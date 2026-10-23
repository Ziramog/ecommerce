/**
 * WOLFIM Commerce Core — Argentine Shipping & Logistics Module
 */
export * from './types/index.js'
export * from './config/default-zones.js'
export * from './utils/postal-code.js'
export * from './calculator/shipping-calculator.js'
export * from './services/shipping-ar-provider.js'

import { ArgentineShippingProviderService } from './services/shipping-ar-provider.js'
export default ArgentineShippingProviderService
