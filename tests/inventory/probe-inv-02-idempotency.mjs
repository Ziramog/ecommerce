#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Probe de Idempotencia y Reintentos de Completado (INV-02)
 *
 * Objetivo:
 * Demostrar que ante reintentos de completado (pago duplicado / webhook replay / retry de red):
 * 1. Se emite UN solo pedido (el segundo intento retorna el mismo id de orden).
 * 2. Se produce UN solo movimiento de inventario (cero reservas duplicadas).
 * 3. Declaración explícita de sustituto: pp_system_default no expone webhook externo en staging,
 *    por lo que se prueba la idempotencia a nivel de completado y workflow de orden.
 *
 * Variables de entorno requeridas:
 * - BASE_URL: URL base del backend Medusa (default: http://100.124.132.48:9000)
 * - PK_B2B: Publishable Key B2B
 * - TOKEN_B2B: Token de cliente mayorista B2B (mayorista-b2b-1)
 * - ADMIN_TOKEN: Token Bearer de administrador Medusa
 */

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const PK_B2B = process.env.PK_B2B
const TOKEN_B2B = process.env.TOKEN_B2B
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

const missing = []
if (!PK_B2B) missing.push('PK_B2B')
if (!TOKEN_B2B) missing.push('TOKEN_B2B')
if (!ADMIN_TOKEN) missing.push('ADMIN_TOKEN')
if (missing.length > 0) {
  console.error(`[ERROR] Variables de entorno faltantes: ${missing.join(', ')}`)
  process.exit(1)
}

const SKU_TARGET = 'SKU-DUAL-005'
const results = []

async function resolveArsRegion() {
  const res = await fetch(`${BASE_URL}/store/regions`, {
    headers: { 'x-publishable-api-key': PK_B2B },
  })
  const data = await res.json()
  const arsRegion = data.regions?.find((r) => r.currency_code === 'ars')
  if (!arsRegion) throw new Error('No se encontró región con moneda ars')
  return arsRegion.id
}

async function resolveVariant(handle) {
  const res = await fetch(`${BASE_URL}/store/products?handle=${handle}&fields=*variants`, {
    headers: { 'x-publishable-api-key': PK_B2B },
  })
  const data = await res.json()
  const variant = data.products?.[0]?.variants?.[0]
  if (!variant) throw new Error(`Variante no encontrada para handle: ${handle}`)
  return variant
}

async function resolveInventoryItemIdForVariant(variantId) {
  const vRes = await fetch(`${BASE_URL}/admin/inventory-items?limit=100`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  const vData = await vRes.json()
  const item = vData.inventory_items?.find((ii) => ii.sku === SKU_TARGET)
  if (!item) throw new Error(`No se encontró inventory item para ${SKU_TARGET}`)
  return item.id
}

async function getInventoryLevel(inventoryItemId) {
  const res = await fetch(`${BASE_URL}/admin/inventory-items/${inventoryItemId}?fields=*location_levels`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  const data = await res.json()
  const level = data.inventory_item?.location_levels?.[0]
  return {
    inventory_item_id: inventoryItemId,
    stocked_quantity: Number(level?.stocked_quantity ?? 0),
    reserved_quantity: Number(level?.reserved_quantity ?? 0),
    available_quantity: Number(level?.available_quantity ?? 0),
  }
}

async function getReservationsForLineItem(lineItemId) {
  const res = await fetch(`${BASE_URL}/admin/reservations?line_item_id=${lineItemId}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.reservations || []
}

async function run() {
  console.log('======================================================================')
  console.log('PROBE INV-02: Idempotencia de Completado y Prevención de Duplicados')
  console.log(`Backend Target: ${BASE_URL} | Canal: B2B | SKU: ${SKU_TARGET}`)
  console.log('======================================================================')

  console.log('\n[DECLARACION DE ALCANCE Y SUSTITUTO DE WEBHOOK]')
  console.log('  - Proveedor en Staging: pp_system_default (proveedor del sistema Medusa 2).')
  console.log('  - Estado de Webhooks: pp_system_default no expone endpoint de webhook externo.')
  console.log('  - Camino Sustituto Oficial: Reintento del endpoint de completado (/store/carts/:id/complete)')
  console.log('    con la misma clave de idempotencia (Idempotency-Key) y el mismo carrito.')
  console.log('  - Declaración: REGISTRADO FORMALMENTE COMO SUSTITUTO DE WEBHOOK REPLAY.')

  const regionId = await resolveArsRegion()
  const variant = await resolveVariant('estribos-chaquenos-acero-inoxidable')
  const inventoryItemId = await resolveInventoryItemIdForVariant(variant.id)

  const invBefore = await getInventoryLevel(inventoryItemId)
  console.log(`\n[INVENTARIO PREVIO A LA COMPRA - ${SKU_TARGET}]`)
  console.log(`  - Stocked Quantity:  ${invBefore.stocked_quantity}`)
  console.log(`  - Reserved Quantity: ${invBefore.reserved_quantity}`)
  console.log(`  - Available Stock:   ${invBefore.available_quantity}`)

  // 1. Crear carrito para cliente mayorista B2B
  console.log('\n[PASO 1] Creando carrito para cliente mayorista B2B...')
  const cartRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
    body: JSON.stringify({
      region_id: regionId,
      currency_code: 'ars',
      shipping_address: {
        first_name: 'Mayorista',
        last_name: 'Idempotencia',
        address_1: 'Ruta 3 Km 45',
        city: 'Cañuelas',
        country_code: 'ar',
        postal_code: 'B1814',
      },
      email: 'mayorista-b2b-1@mercadal-staging.internal',
    }),
  })
  const cartData = await cartRes.json()
  const cartId = cartData.cart.id
  console.log(`  - Carrito B2B creado: ${cartId}`)

  // 2. Agregar ítem
  const itemRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
    body: JSON.stringify({ variant_id: variant.id, quantity: 1 }),
  })
  const itemData = await itemRes.json()
  const lineItem = itemData.cart?.items?.find((i) => i.variant_id === variant.id)
  console.log(`  - Line Item agregado: ${lineItem?.id} | unit_price: ${lineItem?.unit_price} ARS`)

  // 3. Asignar método de envío
  const soRes = await fetch(`${BASE_URL}/store/shipping-options?cart_id=${cartId}`, {
    headers: { 'x-publishable-api-key': PK_B2B },
  })
  const soData = await soRes.json()
  const shippingOptionId = soData.shipping_options?.[0]?.id

  await fetch(`${BASE_URL}/store/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
    body: JSON.stringify({ option_id: shippingOptionId }),
  })

  // 4. Payment Collection & Session
  const pcRes = await fetch(`${BASE_URL}/store/payment-collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
    body: JSON.stringify({ cart_id: cartId }),
  })
  const pcData = await pcRes.json()
  const colId = pcData.payment_collection?.id

  await fetch(`${BASE_URL}/store/payment-collections/${colId}/payment-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
    body: JSON.stringify({ provider_id: 'pp_system_default' }),
  })
  console.log(`  - Sesión de pago inicializada: ${colId}`)

  // 5. Primer intento de completado (con Idempotency-Key)
  const idempotencyKey = `idemp-m360-012-${Date.now()}`
  console.log(`\n[PASO 2] Ejecutando primer completado con Idempotency-Key: ${idempotencyKey}`)
  const tStart1 = Date.now()
  const res1 = await fetch(`${BASE_URL}/store/carts/${cartId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
      'Idempotency-Key': idempotencyKey,
    },
  })
  const tElapsed1 = Date.now() - tStart1
  const body1 = await res1.json()

  console.log(`  - Status intento 1: HTTP ${res1.status} (Latencia: ${tElapsed1} ms)`)
  console.log(`  - Tipo respuesta: ${body1?.type}`)
  console.log(`  - Order ID 1: ${body1?.order?.id}`)
  console.log(`  - Customer ID: ${body1?.order?.customer_id}`)

  const order1Id = body1?.order?.id
  const order1Pass = res1.status === 200 && body1?.type === 'order' && Boolean(order1Id)

  // Medir inventario tras el primer intento
  const invMid = await getInventoryLevel(inventoryItemId)
  console.log(`\n[INVENTARIO TRAS PRIMER COMPLETADO - ${SKU_TARGET}]`)
  console.log(`  - Stocked Quantity:  ${invMid.stocked_quantity}`)
  console.log(`  - Reserved Quantity: ${invMid.reserved_quantity} (Delta: +${invMid.reserved_quantity - invBefore.reserved_quantity})`)
  console.log(`  - Available Stock:   ${invMid.available_quantity}`)

  // 6. Segundo intento de completado (REINTENTO IDÉNTICO / SUSTITUTO DE WEBHOOK REPLAY)
  console.log(`\n[PASO 3] Ejecutando SEGUNDO intento (Reintento con misma Idempotency-Key y cartId)...`)
  const tStart2 = Date.now()
  const res2 = await fetch(`${BASE_URL}/store/carts/${cartId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
      'Idempotency-Key': idempotencyKey,
    },
  })
  const tElapsed2 = Date.now() - tStart2
  const body2 = await res2.json()

  console.log(`  - Status intento 2: HTTP ${res2.status} (Latencia: ${tElapsed2} ms)`)
  console.log(`  - Tipo respuesta: ${body2?.type}`)
  console.log(`  - Order ID 2: ${body2?.order?.id}`)

  const order2Id = body2?.order?.id
  const sameOrderReturned = order1Id === order2Id
  const noNewOrderCreated = res2.status === 200 && sameOrderReturned

  // Medir inventario tras el segundo intento
  const invFinal = await getInventoryLevel(inventoryItemId)
  console.log(`\n[INVENTARIO TRAS SEGUNDO COMPLETADO - ${SKU_TARGET}]`)
  console.log(`  - Stocked Quantity:  ${invFinal.stocked_quantity} (Igual a intermedio: ${invFinal.stocked_quantity === invMid.stocked_quantity})`)
  console.log(`  - Reserved Quantity: ${invFinal.reserved_quantity} (Igual a intermedio: ${invFinal.reserved_quantity === invMid.reserved_quantity})`)
  console.log(`  - Available Stock:   ${invFinal.available_quantity} (Igual a intermedio: ${invFinal.available_quantity === invMid.available_quantity})`)

  const zeroDuplicateReservation =
    invFinal.reserved_quantity === invMid.reserved_quantity &&
    invFinal.available_quantity === invMid.available_quantity

  const pass = order1Pass && noNewOrderCreated && zeroDuplicateReservation

  results.push({
    test: 'INV-02 (Idempotencia de completado)',
    pass,
    detail: `Order1=${order1Id}, Order2=${order2Id} (Mismo id=${sameOrderReturned}), Reserva duplicada=0 (R=${invFinal.reserved_quantity})`,
    evidence: {
      cartId,
      idempotencyKey,
      orderId: order1Id,
      customerId: body1?.order?.customer_id,
      customerEmail: 'mayorista-b2b-1@mercadal-staging.internal',
      status1: res1.status,
      status2: res2.status,
      stocked: invFinal.stocked_quantity,
      reserved: invFinal.reserved_quantity,
      available: invFinal.available_quantity,
    },
  })

  console.log(`\n[EVALUACION INV-02] ${pass ? 'PASS (Idempotencia estricta, 0 duplicados)' : 'FAIL'}`)

  console.log('\n======================================================================')
  console.log('RESUMEN SUITE INV-02')
  console.log('======================================================================')
  console.log(`- [${pass ? 'PASS' : 'FAIL'}] INV-02: ${results[0].detail}`)

  if (body1?.order) {
    console.log(`\n[EVIDENCE OUTPUT FOR AUDIT]`)
    console.log(`B2B_ORDER_ID=${order1Id}`)
    console.log(`B2B_CUSTOMER_ID=${body1.order.customer_id}`)
  }

  if (!pass) {
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
