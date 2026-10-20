import Medusa from '@medusajs/js-sdk'

const backendUrl =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://100.124.132.48:9000'

const publishableKey =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_f8fd5c015c9d12ed6543d7f467cfcbc2f5be4f322cee5036fa05be27b7038801'

export const medusa = new Medusa({
  baseUrl: backendUrl,
  publishableKey: publishableKey,
})
