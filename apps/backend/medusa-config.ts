import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.DATABASE_DRIVER_OPTIONS
      ? JSON.parse(process.env.DATABASE_DRIVER_OPTIONS)
      : undefined,
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
    ...(process.env.MEDUSA_STAGING_RELAX_COOKIES === "true"
      ? { cookieOptions: { sameSite: "lax", secure: false } }
      : {}),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@mercadal/payment-mercadopago",
            id: "mercadopago",
            options: {
              accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "TEST-ACCESS-TOKEN-PLACEHOLDER",
              webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
              sandbox: process.env.MERCADOPAGO_SANDBOX !== "false",
              statementDescriptor: "MERCADAL",
              backUrls: {
                success: process.env.MERCADOPAGO_BACK_URL_SUCCESS || "http://localhost:3000/checkout?status=success",
                pending: process.env.MERCADOPAGO_BACK_URL_PENDING || "http://localhost:3000/checkout?status=pending",
                failure: process.env.MERCADOPAGO_BACK_URL_FAILURE || "http://localhost:3000/checkout?status=failure",
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@mercadal/shipping-ar",
            id: "shipping-ar",
            options: {
              enablePickup: true,
              pickupAddress: "Av. Alvear 1850, Recoleta, CABA",
              globalFreeShippingThreshold: 200000,
            },
          },
        ],
      },
    },
  ],
})
