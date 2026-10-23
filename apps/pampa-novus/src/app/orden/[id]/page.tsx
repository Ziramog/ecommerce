'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatCurrencyARS } from '@/lib/utils'
import { OrderConfirmationView } from '@mercadal/commerce-ui'
import { CartGateway, isMockFallbackAllowed, type CommerceOrderConfirmation } from '@mercadal/commerce-core'
import { medusa } from '@/lib/medusa'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = (params?.id as string) || ''

  const [order, setOrder] = useState<CommerceOrderConfirmation | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      setError('Identificador de orden no provisto.')
      return
    }

    let isMounted = true

    async function loadOrder() {
      setIsLoading(true)
      setError(null)

      try {
        const gateway = new CartGateway(medusa)

        const realOrder = await gateway.getOrder(orderId)

        if (!isMounted) return

        if (realOrder) {
          setOrder(realOrder)
        } else {
          // If order not found in Medusa
          if (isMockFallbackAllowed()) {
            // Local dev simulation only
            setOrder({
              id: orderId,
              displayId: orderId.replace(/^ord_/, '').toUpperCase(),
              cartId: 'cart_local_sim',
              email: 'desarrollo@mercadal.com.ar',
              status: 'pending',
              currencyCode: 'ARS',
              total: 85000,
              items: [
                {
                  id: 'item_sim_1',
                  variantId: 'variant_01',
                  title: 'Bozal de Cuero Crudo Trenzado 8 Cabos (Simulado)',
                  unitPrice: 85000,
                  quantity: 1,
                  total: 85000,
                },
              ],
              shippingAddress: {
                firstName: 'Cliente',
                lastName: 'Prueba Local',
                address1: 'Av. Alvear 1850',
                city: 'CABA',
                province: 'Ciudad Autónoma de Buenos Aires',
                postalCode: '1425',
                countryCode: 'ar',
              },
              createdAt: new Date().toISOString(),
            })
          } else {
            setError(
              'No se encontró una orden confirmada con este identificador en el sistema de comercio. Si completaste un pago reciente, la pasarela puede tardar unos minutos en asentar la transacción.'
            )
          }
        }
      } catch (err: any) {
        if (!isMounted) return
        if (isMockFallbackAllowed()) {
          setOrder({
            id: orderId,
            displayId: orderId.replace(/^ord_/, '').toUpperCase(),
            cartId: 'cart_local_sim',
            email: 'desarrollo@mercadal.com.ar',
            status: 'pending',
            currencyCode: 'ARS',
            total: 85000,
            items: [
              {
                id: 'item_sim_1',
                variantId: 'variant_01',
                title: 'Bozal de Cuero Crudo Trenzado 8 Cabos (Simulado)',
                unitPrice: 85000,
                quantity: 1,
                total: 85000,
              },
            ],
            shippingAddress: {
              firstName: 'Cliente',
              lastName: 'Prueba Local',
              address1: 'Av. Alvear 1850',
              city: 'CABA',
              province: 'Ciudad Autónoma de Buenos Aires',
              postalCode: '1425',
              countryCode: 'ar',
            },
            createdAt: new Date().toISOString(),
          })
        } else {
          setError(
            'No se pudo verificar el estado del pedido contra el backend Medusa. Por razones de seguridad comercial no mostramos confirmación de compra sin validación de estado.'
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadOrder()

    return () => {
      isMounted = false
    }
  }, [orderId])

  return (
    <div className="py-16 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="p-12 bg-white border border-[#D9C9A8] rounded-[2px] max-w-2xl mx-auto shadow-sm text-center">
            <div className="w-8 h-8 border-2 border-[#2E1C12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="font-serif text-xl text-[#221814] font-semibold mb-1">
              Verificando estado del pedido en Medusa...
            </h2>
            <p className="text-xs text-[#4A2D1B]/70 font-sans">
              Consultando la autoridad comercial de la orden #{orderId}
            </p>
          </div>
        ) : error || !order ? (
          <div className="p-8 sm:p-10 bg-white border border-[#E5A8A8] rounded-[2px] max-w-2xl mx-auto shadow-sm text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              !
            </div>
            <h1 className="font-serif text-2xl text-[#221814] font-semibold mb-3">
              Estado de Pedido no Verificado
            </h1>
            <p className="text-sm text-[#4A2D1B]/80 mb-6 leading-relaxed">
              {error || 'No fue posible validar los datos de la orden.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/catalogo"
                className="inline-block py-3 px-6 bg-[#2E1C12] hover:bg-[#4A2E1E] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold rounded-[2px] transition-all"
              >
                Volver a la Tienda
              </Link>
            </div>
          </div>
        ) : (
          <OrderConfirmationView
            order={order}
            formatCurrency={formatCurrencyARS}
            paymentInstructions={
              order.status === 'pending' ? (
                <div className="p-4 bg-[#FAF7F2] border border-[#D9C9A8] rounded-[2px] text-xs text-[#4A2D1B] space-y-1">
                  <p className="font-bold text-[#2E1C12] uppercase tracking-wider mb-1">
                    Datos para Transferencia Bancaria Directa:
                  </p>
                  <p>Banco: Banco Galicia</p>
                  <p>Titular: Talabartería Mercadal S.A.</p>
                  <p>CUIT: 30-71123456-9</p>
                  <p>CBU: 0070123420000012345678</p>
                  <p>Alias: MERCADAL.PAMPA.OFICIAL</p>
                  <p className="pt-2 text-[11px] text-[#4A2D1B]/70">
                    Por favor envía el comprobante indicando tu número de orden a <span className="font-semibold">pagos@mercadal.com.ar</span>.
                  </p>
                </div>
              ) : undefined
            }
            themeClasses={{
              card: 'p-8 sm:p-10 bg-white border border-[#D9C9A8] rounded-[2px] max-w-2xl mx-auto shadow-sm',
              title: 'font-serif text-3xl text-[#221814] font-semibold mb-3 tracking-tight',
              button:
                'inline-block py-3.5 px-8 bg-[#2E1C12] hover:bg-[#4A2E1E] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold rounded-[2px] transition-all shadow-sm',
            }}
          />
        )}
      </div>
    </div>
  )
}
