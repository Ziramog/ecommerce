import Medusa from '@medusajs/js-sdk'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://100.124.132.48:9000'

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_9cdf686a153ec2a8cf7b6933217c328933735be186aa433e426f7703a3c8872d'

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === 'development',
})

export const B2C_PUBLISHABLE_KEY = PUBLISHABLE_KEY
export const MEDUSA_BACKEND_URL = BACKEND_URL
