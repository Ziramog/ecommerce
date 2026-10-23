'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { formatCurrencyARS } from '@/lib/utils'
import {
  CheckoutContactStep,
  CheckoutAddressStep,
  CheckoutShippingStep,
  OrderSummaryCard,
} from '@mercadal/commerce-ui'
import {
  validateCustomerContact,
  validateShippingAddress,
  type CommerceCustomerInput,
  type CommerceAddress,
  type CommerceShippingOption,
} from '@mercadal/commerce-core'
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'

type CheckoutStep = 'contact' | 'address' | 'shipping' | 'payment'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartId, items, subtotal, cartGateway, clearCart, isLoading: isCartLoading } = useCart()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact')
  const [customer, setCustomer] = useState<CommerceCustomerInput>({
    email: cart?.email || '',
    phone: '',
    documentId: '',
  })
  const [shippingAddress, setShippingAddress] = useState<CommerceAddress | undefined>(cart?.shippingAddress)
  const [shippingOptions, setShippingOptions] = useState<CommerceShippingOption[]>([])
  const [selectedShippingId, setSelectedShippingId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'mock_card'>('transfer')

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load shipping options when entering shipping step
  useEffect(() => {
    if (cartId && (currentStep === 'shipping' || currentStep === 'payment')) {
      cartGateway
        .listShippingOptions(cartId)
        .then((options) => {
          setShippingOptions(options)
          if (options.length > 0 && !selectedShippingId) {
            setSelectedShippingId(options[0].id)
          }
        })
        .catch((err) => console.warn('Error listando opciones de envío:', err))
    }
  }, [cartId, currentStep, cartGateway, selectedShippingId])

  // Pampa Novus Boutique Theme Tokens for Commerce UI components
  const themeClasses = {
    input:
      'w-full px-3.5 py-2.5 bg-white border border-[#D9C9A8] rounded-[2px] text-sm text-[#221814] focus:outline-none focus:ring-1 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] transition-colors',
    select:
      'w-full px-3.5 py-2.5 bg-white border border-[#D9C9A8] rounded-[2px] text-sm text-[#221814] focus:outline-none focus:ring-1 focus:ring-[#8B5A2B] focus:border-[#8B5A2B] transition-colors',
    label: 'block text-xs font-sans font-semibold uppercase tracking-[0.16em] text-[#4A2D1B] mb-1.5',
    button:
      'w-full py-3.5 px-6 bg-[#2E1C12] hover:bg-[#4A2E1E] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold transition-all duration-300 rounded-[2px] shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer',
    backButton:
      'py-3.5 px-6 border border-[#D9C9A8] hover:bg-[#EFE8DE] text-[#4A2D1B] text-xs uppercase tracking-[0.16em] font-sans font-semibold transition-all duration-200 rounded-[2px] cursor-pointer',
    error: 'text-xs text-red-700 mt-1 font-sans font-medium',
  }

  // Handle Step 1: Contact
  const handleContactSubmit = async (data: CommerceCustomerInput) => {
    setErrorMessage(null)
    const val = validateCustomerContact(data)
    if (!val.isValid) {
      setStepErrors(val.errors)
      return
    }
    setStepErrors({})
    setCustomer(data)

    if (cartId) {
      try {
        setIsSubmitting(true)
        await cartGateway.updateCartCustomerAndAddresses(cartId, {
          email: data.email,
        })
      } catch (err: any) {
        console.warn('Error guardando contacto en Medusa:', err)
      } finally {
        setIsSubmitting(false)
      }
    }

    setCurrentStep('address')
  }

  // Handle Step 2: Address
  const handleAddressSubmit = async (addr: CommerceAddress) => {
    setErrorMessage(null)
    const val = validateShippingAddress(addr)
    if (!val.isValid) {
      setStepErrors(val.errors)
      return
    }
    setStepErrors({})
    setShippingAddress(addr)

    if (cartId) {
      try {
        setIsSubmitting(true)
        await cartGateway.updateCartCustomerAndAddresses(cartId, {
          email: customer.email,
          shippingAddress: addr,
          billingAddress: addr,
        })
      } catch (err: any) {
        console.warn('Error guardando domicilio en Medusa:', err)
      } finally {
        setIsSubmitting(false)
      }
    }

    setCurrentStep('shipping')
  }

  // Handle Step 3: Shipping Method
  const handleShippingSubmit = async () => {
    setErrorMessage(null)
    if (!selectedShippingId) {
      setErrorMessage('Por favor seleccione una opción de envío.')
      return
    }

    if (cartId) {
      try {
        setIsSubmitting(true)
        await cartGateway.setShippingMethod(cartId, selectedShippingId)
      } catch (err: any) {
        console.warn('Error fijando método de envío en Medusa:', err)
      } finally {
        setIsSubmitting(false)
      }
    }

    setCurrentStep('payment')
  }

  // Handle Step 4: Final Order Placement (Medusa completeCartWorkflow)
  const handlePlaceOrder = async () => {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      if (cartId) {
        const orderConfirmation = await cartGateway.completeCart(cartId)
        clearCart()
        router.push(`/orden/${orderConfirmation.id}`)
      } else {
        // Local simulation fallback
        const simulatedOrderId = 'ord_' + Math.random().toString(36).substring(2, 11)
        clearCart()
        router.push(`/orden/${simulatedOrderId}`)
      }
    } catch (err: any) {
      console.error('Error al confirmar pedido:', err)
      setErrorMessage(
        err?.message || 'Ocurrió un error al procesar el pedido. Por favor intente nuevamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Empty Cart Guard
  if (items.length === 0 && !isCartLoading) {
    return (
      <div className="py-24 bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#8B5A2B] font-bold block mb-2">
            Bolsa Vacía
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#221814] mb-4">No hay artículos para comprar</h1>
          <p className="text-sm text-[#4A2D1B]/80 mb-8 leading-relaxed">
            Explorá el catálogo de Pampa Novus y seleccioná piezas de tradición ecuestre antes de continuar al checkout.
          </p>
          <Link
            href="/catalogo"
            className="inline-block py-3.5 px-8 bg-[#2E1C12] hover:bg-[#4A2E1E] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold rounded-[2px] transition-all"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/carrito"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.18em] text-[#8B5A2B] hover:text-[#2E1C12] transition-colors mb-4 font-semibold"
          >
            <ArrowLeft size={14} />
            <span>Volver a la Bolsa</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#221814] font-semibold tracking-tight">
            Checkout Seguro — Pampa Novus
          </h1>
          <p className="text-xs font-sans uppercase tracking-[0.2em] text-[#8B5A2B] mt-1">
            Canal Minorista Oficial · Talabartería Mercadal
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mb-10 bg-white p-4 rounded-[2px] border border-[#D9C9A8] shadow-sm">
          <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-sans uppercase tracking-wider font-semibold">
            <button
              type="button"
              onClick={() => setCurrentStep('contact')}
              className={`flex items-center space-x-2 ${
                currentStep === 'contact' ? 'text-[#8B5A2B]' : 'text-[#221814]'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Contacto</span>
            </button>

            <span className="text-[#D9C9A8]">―</span>

            <button
              type="button"
              onClick={() => customer.email && setCurrentStep('address')}
              disabled={!customer.email}
              className={`flex items-center space-x-2 ${
                currentStep === 'address' ? 'text-[#8B5A2B]' : !customer.email ? 'text-neutral-400' : 'text-[#221814]'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Entrega</span>
            </button>

            <span className="text-[#D9C9A8]">―</span>

            <button
              type="button"
              onClick={() => shippingAddress && setCurrentStep('shipping')}
              disabled={!shippingAddress}
              className={`flex items-center space-x-2 ${
                currentStep === 'shipping' ? 'text-[#8B5A2B]' : !shippingAddress ? 'text-neutral-400' : 'text-[#221814]'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Envío</span>
            </button>

            <span className="text-[#D9C9A8]">―</span>

            <span
              className={`flex items-center space-x-2 ${
                currentStep === 'payment' ? 'text-[#8B5A2B]' : 'text-neutral-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Pago</span>
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[2px] text-red-800 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Two-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Step Form (Col 1-7) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2px] border border-[#D9C9A8] shadow-sm">
            {currentStep === 'contact' && (
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#221814] font-semibold mb-2">
                  1. Datos de Contacto
                </h2>
                <p className="text-xs text-[#4A2D1B]/80 mb-6 font-sans">
                  Compra como invitado. No requerimos contraseña para procesar tu pedido.
                </p>
                <CheckoutContactStep
                  initialValues={customer}
                  onSubmit={handleContactSubmit}
                  isLoading={isSubmitting}
                  errors={stepErrors}
                  themeClasses={themeClasses}
                />
              </div>
            )}

            {currentStep === 'address' && (
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#221814] font-semibold mb-2">
                  2. Domicilio de Entrega (Argentina)
                </h2>
                <p className="text-xs text-[#4A2D1B]/80 mb-6 font-sans">
                  Ingresá la dirección postal para calcular los fletes y coordinar la entrega.
                </p>
                <CheckoutAddressStep
                  initialValues={shippingAddress}
                  onSubmit={handleAddressSubmit}
                  onBack={() => setCurrentStep('contact')}
                  isLoading={isSubmitting}
                  errors={stepErrors}
                  themeClasses={themeClasses}
                />
              </div>
            )}

            {currentStep === 'shipping' && (
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#221814] font-semibold mb-2">
                  3. Método de Envío
                </h2>
                <p className="text-xs text-[#4A2D1B]/80 mb-6 font-sans">
                  Opciones disponibles para{' '}
                  <span className="font-semibold text-[#221814]">
                    {shippingAddress?.city}, {shippingAddress?.province} (CP {shippingAddress?.postalCode})
                  </span>
                </p>
                <CheckoutShippingStep
                  options={shippingOptions}
                  selectedOptionId={selectedShippingId}
                  onSelectOption={setSelectedShippingId}
                  onSubmit={handleShippingSubmit}
                  onBack={() => setCurrentStep('address')}
                  isLoading={isSubmitting}
                  formatCurrency={formatCurrencyARS}
                  themeClasses={{
                    button: themeClasses.button,
                    backButton: themeClasses.backButton,
                    selectedCard:
                      'p-4 border-2 border-[#2E1C12] rounded-[2px] cursor-pointer flex items-center justify-between bg-[#FAF7F2]',
                  }}
                />
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#221814] font-semibold mb-2">
                    4. Medio de Pago
                  </h2>
                  <p className="text-xs text-[#4A2D1B]/80 mb-6 font-sans">
                    Seleccioná tu método preferido para abonar en Pesos Argentinos (ARS).
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Transfer Option */}
                  <div
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 border rounded-[2px] cursor-pointer transition-colors ${
                      paymentMethod === 'transfer'
                        ? 'border-2 border-[#2E1C12] bg-[#FAF7F2]'
                        : 'border-[#D9C9A8] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'transfer' ? 'border-[#2E1C12]' : 'border-neutral-400'
                          }`}
                        >
                          {paymentMethod === 'transfer' && <div className="w-2 h-2 rounded-full bg-[#2E1C12]" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#221814]">
                            Transferencia Bancaria Directa
                          </p>
                          <p className="text-xs text-[#4A2D1B]/80 mt-0.5">
                            CBU / Alias bancario de Talabartería Mercadal S.A.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-green-800 bg-green-50 px-2.5 py-1 rounded">
                        Disponible
                      </span>
                    </div>

                    {paymentMethod === 'transfer' && (
                      <div className="mt-4 pt-3 border-t border-[#D9C9A8]/60 text-xs text-[#4A2D1B] space-y-1 font-mono">
                        <p>Banco: Galicia · Cuenta Corriente Especial</p>
                        <p>CBU: 0070123420000012345678</p>
                        <p>Alias: TALABARTERIA.MERCADAL</p>
                        <p>CUIT: 30-71234567-8</p>
                        <p className="text-[11px] text-[#8B5A2B] pt-1">
                          * Los datos para el comprobante se enviarán por email al confirmar el pedido.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sandbox Card Simulation */}
                  <div
                    onClick={() => setPaymentMethod('mock_card')}
                    className={`p-4 border rounded-[2px] cursor-pointer transition-colors ${
                      paymentMethod === 'mock_card'
                        ? 'border-2 border-[#2E1C12] bg-[#FAF7F2]'
                        : 'border-[#D9C9A8] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'mock_card' ? 'border-[#2E1C12]' : 'border-neutral-400'
                          }`}
                        >
                          {paymentMethod === 'mock_card' && <div className="w-2 h-2 rounded-full bg-[#2E1C12]" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#221814]">
                            Mercado Pago (Sandbox / Simulación G1)
                          </p>
                          <p className="text-xs text-[#4A2D1B]/80 mt-0.5">
                            Tarjetas de Crédito / Débito en hasta 3 cuotas sin interés
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                        Staging
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('shipping')}
                    disabled={isSubmitting}
                    className={themeClasses.backButton}
                  >
                    ← Volver
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className={themeClasses.button}
                  >
                    {isSubmitting ? 'Confirmando pedido en Medusa 2...' : 'Confirmar y Finalizar Pedido →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (Col 8-12) */}
          <div className="lg:col-span-5">
            {cart ? (
              <OrderSummaryCard
                cart={cart}
                formatCurrency={formatCurrencyARS}
                themeClasses={{
                  card: 'p-6 sm:p-8 bg-white border border-[#D9C9A8] rounded-[2px] shadow-sm',
                  title:
                    'font-serif text-lg text-[#221814] font-semibold pb-3 border-b border-[#EFE8DE] mb-5 tracking-tight',
                  rowLabel: 'text-sm text-[#4A2D1B]/90',
                  rowValue: 'text-sm font-semibold text-[#221814]',
                  totalRow:
                    'pt-4 border-t border-[#D9C9A8] flex items-center justify-between mt-4 text-[#221814]',
                }}
              />
            ) : (
              <div className="p-6 bg-white border border-[#D9C9A8] rounded-[2px] shadow-sm">
                <h2 className="font-serif text-lg text-[#221814] font-semibold mb-4 pb-2 border-b border-[#EFE8DE]">
                  Resumen de Compra
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#4A2D1B]/90">Subtotal ({items.length} ítems)</span>
                    <span className="font-semibold text-[#221814]">{formatCurrencyARS(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A2D1B]/90">Envío</span>
                    <span className="font-semibold text-green-800">A calcular</span>
                  </div>
                  <div className="pt-3 border-t border-[#D9C9A8] flex justify-between font-bold text-base">
                    <span>Total Estimado</span>
                    <span>{formatCurrencyARS(subtotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Security badge */}
            <div className="mt-4 p-4 bg-white/70 border border-[#D9C9A8]/70 rounded-[2px] flex items-center space-x-3 text-xs text-[#4A2D1B]">
              <ShieldCheck size={20} className="text-[#8B5A2B] flex-shrink-0" />
              <span>Transacción respaldada por la arquitectura Medusa 2 de Talabartería Mercadal S.A.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
