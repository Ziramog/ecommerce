import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { CartGateway } from '../cart/cart-gateway'
import { validateCustomerContact, validateShippingAddress } from '../checkout/checkout-gateway'

describe('WOLFIM Commerce Core — Cart Gateway & Validations', () => {
  const mockMedusaClient: any = {
    store: {
      cart: {
        create: async () => ({
          cart: {
            id: 'cart_test_123',
            region_id: 'reg_ars',
            currency_code: 'ars',
            items: [
              {
                id: 'item_1',
                variant_id: 'var_1',
                title: 'Bozal Criollo',
                unit_price: 85000,
                quantity: 2,
                total: 170000,
              },
            ],
            subtotal: 170000,
            total: 170000,
          },
        }),
        retrieve: async (id: string) => ({
          cart: {
            id,
            region_id: 'reg_ars',
            currency_code: 'ars',
            items: [],
            subtotal: 0,
            total: 0,
          },
        }),
      },
      fulfillment: {
        listCartOptions: async () => ({
          shipping_options: [
            { id: 'opt_andreani', name: 'Andreani Estándar', amount: 6500, price_type: 'flat' },
          ],
        }),
      },
      order: {
        retrieve: async (id: string) => {
          if (id === 'ord_real_999') {
            return {
              order: {
                id: 'ord_real_999',
                display_id: 1001,
                email: 'cliente@mercadal.com.ar',
                status: 'pending',
                currency_code: 'ars',
                total: 85000,
                items: [
                  {
                    id: 'item_1',
                    title: 'Bozal Criollo',
                    unit_price: 85000,
                    quantity: 1,
                    total: 85000,
                  },
                ],
                shipping_address: {
                  first_name: 'Juan',
                  last_name: 'Pérez',
                  address_1: 'Av. Libertador 1200',
                  city: 'CABA',
                  province: 'Buenos Aires',
                  postal_code: '1425',
                },
              },
            }
          }
          throw { status: 404, message: 'Order not found' }
        },
      },
    },
  }

  const gateway = new CartGateway(mockMedusaClient)

  test('createCart() maps Medusa raw response to canonical CommerceCart', async () => {
    const cart = await gateway.createCart({ regionId: 'reg_ars' })
    assert.equal(cart.id, 'cart_test_123')
    assert.equal(cart.currencyCode, 'ARS')
    assert.equal(cart.items.length, 1)
    assert.equal(cart.items[0].unitPrice, 85000)
    assert.equal(cart.items[0].quantity, 2)
    assert.equal(cart.totals.total, 170000)
  })

  test('validateCustomerContact() catches invalid or empty emails', () => {
    const resEmpty = validateCustomerContact({ email: '' })
    assert.equal(resEmpty.isValid, false)
    assert.ok(resEmpty.errors.email)

    const resInvalid = validateCustomerContact({ email: 'bad-email' })
    assert.equal(resInvalid.isValid, false)
    assert.ok(resInvalid.errors.email)

    const resValid = validateCustomerContact({ email: 'cliente@mercadal.com.ar', documentId: '38123456' })
    assert.equal(resValid.isValid, true)
    assert.equal(Object.keys(resValid.errors).length, 0)
  })

  test('validateShippingAddress() enforces 4-digit or CPA postal codes', () => {
    const resInvalidCP = validateShippingAddress({
      firstName: 'Juan',
      lastName: 'Pérez',
      address1: 'Av. Libertador 1200',
      city: 'CABA',
      province: 'Buenos Aires',
      postalCode: '123', // invalid 3 digits
    })
    assert.equal(resInvalidCP.isValid, false)
    assert.ok(resInvalidCP.errors.postalCode)

    const resValid4Digit = validateShippingAddress({
      firstName: 'Juan',
      lastName: 'Pérez',
      address1: 'Av. Libertador 1200',
      city: 'CABA',
      province: 'Buenos Aires',
      postalCode: '1425',
    })
    assert.equal(resValid4Digit.isValid, true)

    const resValidCPA = validateShippingAddress({
      firstName: 'Juan',
      lastName: 'Pérez',
      address1: 'Av. Libertador 1200',
      city: 'CABA',
      province: 'Buenos Aires',
      postalCode: 'C1425BND',
    })
    assert.equal(resValidCPA.isValid, true)
  })

  test('getOrder() retrieves validated order from Medusa and returns null for 404', async () => {
    const order = await gateway.getOrder('ord_real_999')
    assert.ok(order)
    assert.equal(order?.id, 'ord_real_999')
    assert.equal(order?.displayId, '1001')
    assert.equal(order?.status, 'pending')
    assert.equal(order?.total, 85000)

    const notFound = await gateway.getOrder('ord_non_existent')
    assert.equal(notFound, null)
  })
})
