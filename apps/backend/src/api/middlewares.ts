import {
  defineMiddlewares,
  authenticate,
  configureStoreSearch,
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'

// Middlewares globales y de rutas para Mercadal Digital 360
export default defineMiddlewares({
  routes: [
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      method: ['GET'],
      matcher: '/store/orders/:id',
      middlewares: [
        // 1. Extraer o validar sesión de cliente (permite anónimos para compras de invitados legítimas)
        authenticate('customer', ['session', 'bearer'], {
          allowUnauthenticated: true,
        }),
        // 2. Scoping mandatorio de orden por sales channel y cliente (SEC-02 / ADR-004)
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const orderId = req.params.id
          if (!orderId) {
            return next()
          }

          const orderModule = req.scope.resolve(Modules.ORDER) as any
          let order: any
          try {
            order = await orderModule.retrieveOrder(orderId, {
              select: ['id', 'sales_channel_id', 'customer_id'],
            })
          } catch {
            return res.status(404).json({
              type: 'not_found',
              message: `Order with id: ${orderId} was not found.`,
            })
          }

          if (!order) {
            return res.status(404).json({
              type: 'not_found',
              message: `Order with id: ${orderId} was not found.`,
            })
          }

          // Validación de Sales Channel (Cross-brand / Cross-channel isolation)
          const publishableSalesChannelIds = (req as any).publishable_key_context?.sales_channel_ids || []
          if (publishableSalesChannelIds.length > 0) {
            if (!order.sales_channel_id || !publishableSalesChannelIds.includes(order.sales_channel_id)) {
              return res.status(404).json({
                type: 'not_found',
                message: `Order with id: ${orderId} was not found.`,
              })
            }
          }

          // Validación de Pertenencia del Cliente (Cross-customer isolation)
          const authenticatedCustomerId = (req as any).auth_context?.actor_id
          if (authenticatedCustomerId) {
            if (order.customer_id && order.customer_id !== authenticatedCustomerId) {
              return res.status(404).json({
                type: 'not_found',
                message: `Order with id: ${orderId} was not found.`,
              })
            }
          } else {
            // Petición anónima: no se permite acceso por ID a pedidos de clientes registrados
            if (order.customer_id) {
              return res.status(404).json({
                type: 'not_found',
                message: `Order with id: ${orderId} was not found.`,
              })
            }
          }

          return next()
        },
      ],
    },
  ],
})
