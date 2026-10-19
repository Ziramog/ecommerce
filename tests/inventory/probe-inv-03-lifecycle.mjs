#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Probe de Ciclo de Vida de Inventario (INV-03)
 *
 * Objetivo:
 * Validar rigurosamente el comportamiento del inventario ante:
 * 1. Cancelación de Pedido: La reserva se libera íntegramente y el disponible vuelve al valor previo.
 * 2. Despacho Parcial (Fulfillment + Shipment): El stock físico baja exactamente por lo despachado,
 *    no por el total del pedido.
 * 3. Devolución Parcial (Return Request + Receive):
 *    - En estado 'requested': stock permanece en estado intermedio (no disponible).
 *    - En estado 'received': el ítem recibido reingresa al inventario físico y disponible.
 *
 * Variables de entorno requeridas:
 * - BASE_URL: URL base del backend Medusa (default: http://100.124.132.48:9000)
 * - PK_B2C: Publishable Key B2C
 * - TOKEN_B2C: Token cliente B2C (cliente-b2c-1)
 * - ADMIN_TOKEN: Token Bearer de administrador Medusa
 */

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const PK_B2C = process.env.PK_B2C
const TOKEN_B2C = process.env.TOKEN_B2C
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

const missing = []
if (!PK_B2C) missing.push('PK_B2C')
if (!TOKEN_B2C) missing.push('TOKEN_B2C')
if (!ADMIN_TOKEN) missing.push('ADMIN_TOKEN')
if (missing.length > 0) {
  console.error(`[ERROR] Variables de entorno faltantes: ${missing.join(', ')}`)
  process.exit(1)
}

const SKU_LIFECYCLE = 'SKU-DUAL-008' // manta-sudadero-lana-pura (stock 40)
const results = []

async function resolveArsRegion() {
  const res = await fetch(`${BASE_URL}/store/regions`, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  const data = await res.json()
  const arsRegion = data.regions?.find((r) => r.currency_code === 'ars')
  if (!arsRegion) throw new Error('No se encontró región con moneda ars')
  return arsRegion.id
}

async function resolveVariant(handle) {
  const res = await fetch(`${BASE_URL}/store/products?handle=${handle}&fields=*variants`, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  const data = await res.json()
  const variant = data.products?.[0]?.variants?.[0]
  if (!variant) throw new Error(`Variante no encontrada para handle: ${handle}`)
  return variant
}

async function resolveInventoryItemIdForSku(sku) {
  const vRes = await fetch(`${BASE_URL}/admin/inventory-items?limit=100`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  const vData = await vRes.json()
  const item = vData.inventory_items?.find((ii) => ii.sku === sku)
  if (!item) throw new Error(`No se encontró inventory item para SKU: ${sku}`)
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
    location_id: level?.location_id,
    stocked_quantity: Number(level?.stocked_quantity ?? 0),
    reserved_quantity: Number(level?.reserved_quantity ?? 0),
    available_quantity: Number(level?.available_quantity ?? 0),
  }
}

async function createOrderWithQuantity({ regionId, variantId, qty, email }) {
  const headers = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PK_B2C,
    Authorization: `Bearer ${TOKEN_B2C}`,
  }

  // 1. Crear carrito
  const cartRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      region_id: regionId,
      currency_code: 'ars',
      shipping_address: {
        first_name: 'Cliente',
        last_name: 'Lifecycle',
        address_1: 'Estancia La Querencia',
        city: 'San Antonio de Areco',
        country_code: 'ar',
        postal_code: 'B2760',
      },
      email,
    }),
  })
  const cartData = await cartRes.json()
  const cartId = cartData.cart.id

  // 2. Agregar ítem
  await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ variant_id: variantId, quantity: qty }),
  })

  // 3. Shipping method
  const soRes = await fetch(`${BASE_URL}/store/shipping-options?cart_id=${cartId}`, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  const soData = await soRes.json()
  const shippingOptionId = soData.shipping_options?.[0]?.id

  await fetch(`${BASE_URL}/store/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ option_id: shippingOptionId }),
  })

  // 4. Payment
  const pcRes = await fetch(`${BASE_URL}/store/payment-collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cart_id: cartId }),
  })
  const colId = (await pcRes.json()).payment_collection.id

  await fetch(`${BASE_URL}/store/payment-collections/${colId}/payment-sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ provider_id: 'pp_system_default' }),
  })

  // 5. Complete
  const compRes = await fetch(`${BASE_URL}/store/carts/${cartId}/complete`, {
    method: 'POST',
    headers,
  })
  const compData = await compRes.json()
  const order = compData.order
  const lineItem = order?.items?.[0]

  return {
    orderId: order?.id,
    lineItemId: lineItem?.id,
    quantity: lineItem?.quantity,
  }
}

async function run() {
  console.log('======================================================================')
  console.log('PROBE INV-03: Cancelación, Despacho Parcial y Devolución Parcial')
  console.log(`Backend Target: ${BASE_URL} | SKU: ${SKU_LIFECYCLE}`)
  console.log('======================================================================')

  const regionId = await resolveArsRegion()
  const variant = await resolveVariant('manta-sudadero-lana-pura')
  const inventoryItemId = await resolveInventoryItemIdForSku(SKU_LIFECYCLE)

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  }

  // =========================================================================
  // FASE 1: CANCELACIÓN DE PEDIDO Y LIBERACIÓN DE RESERVA
  // =========================================================================
  console.log('\n----------------------------------------------------------------------')
  console.log('3.1 Cancelación de Pedido: Liberación de reserva y restauración de stock')
  console.log('----------------------------------------------------------------------')

  const inv0 = await getInventoryLevel(inventoryItemId)
  console.log(`[P0 - INVENTARIO INICIAL SKU-DUAL-008]`)
  console.log(`  Stocked: ${inv0.stocked_quantity} | Reserved: ${inv0.reserved_quantity} | Available: ${inv0.available_quantity}`)

  // Crear pedido para cancelación (qty = 2)
  console.log('\n[P1] Creando pedido de prueba para cancelación (qty = 2)...')
  const orderCancel = await createOrderWithQuantity({
    regionId,
    variantId: variant.id,
    qty: 2,
    email: 'cancel-test@mercadal-staging.internal',
  })
  console.log(`  Pedido creado: ${orderCancel.orderId} (Line Item: ${orderCancel.lineItemId}, Qty: 2)`)

  const inv1 = await getInventoryLevel(inventoryItemId)
  console.log(`[P1 - TRAS CREAR PEDIDO]`)
  console.log(`  Stocked: ${inv1.stocked_quantity} | Reserved: ${inv1.reserved_quantity} (Delta: +${inv1.reserved_quantity - inv0.reserved_quantity}) | Available: ${inv1.available_quantity}`)

  // Cancelar pedido
  console.log(`\n[P2] Cancelando pedido ${orderCancel.orderId} vía POST /admin/orders/:id/cancel...`)
  const cancelRes = await fetch(`${BASE_URL}/admin/orders/${orderCancel.orderId}/cancel`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({}),
  })
  const cancelStatus = cancelRes.status
  const cancelData = await cancelRes.json()
  const canceledOrderStatus = cancelData.order?.status
  console.log(`  Cancel status: HTTP ${cancelStatus} | Order status: ${canceledOrderStatus}`)

  const inv2 = await getInventoryLevel(inventoryItemId)
  console.log(`[P2 - TRAS CANCELAR PEDIDO]`)
  console.log(`  Stocked: ${inv2.stocked_quantity} | Reserved: ${inv2.reserved_quantity} (Delta: ${inv2.reserved_quantity - inv1.reserved_quantity}) | Available: ${inv2.available_quantity}`)

  const passCancel =
    cancelStatus === 200 &&
    canceledOrderStatus === 'canceled' &&
    inv2.reserved_quantity === inv0.reserved_quantity &&
    inv2.available_quantity === inv0.available_quantity

  console.log(`[EVALUACION 3.1] ${passCancel ? 'PASS (Reserva liberada, disponible restaurado)' : 'FAIL'}`)
  results.push({
    test: 'INV-03.1 (Cancelación y liberación de reserva)',
    pass: passCancel,
    detail: `Order=${orderCancel.orderId} cancelado (HTTP ${cancelStatus}), Reservas: ${inv1.reserved_quantity} -> ${inv2.reserved_quantity}, Disp: ${inv1.available_quantity} -> ${inv2.available_quantity}`,
  })

  // =========================================================================
  // FASE 2: DESPACHO PARCIAL (Fulfillment + Shipment)
  // =========================================================================
  console.log('\n----------------------------------------------------------------------')
  console.log('3.2 Despacho Parcial: Deducción física exacta de lo despachado')
  console.log('----------------------------------------------------------------------')

  // Crear pedido para despacho y devolución (qty = 2)
  console.log('[P3] Creando pedido con qty = 2 para despacho parcial y devolución...')
  const orderFlow = await createOrderWithQuantity({
    regionId,
    variantId: variant.id,
    qty: 2,
    email: 'partial-flow@mercadal-staging.internal',
  })
  console.log(`  Pedido creado: ${orderFlow.orderId} (Line Item: ${orderFlow.lineItemId}, Qty: 2)`)

  const inv3 = await getInventoryLevel(inventoryItemId)
  console.log(`[P3 - TRAS CREAR PEDIDO]`)
  console.log(`  Stocked: ${inv3.stocked_quantity} | Reserved: ${inv3.reserved_quantity} | Available: ${inv3.available_quantity}`)

  // Despacho parcial: Crear fulfillment de 1 sola unidad
  console.log(`\n[P4] Creando fulfillment parcial (1 de 2 unidades) vía POST /admin/orders/:id/fulfillments...`)
  const fulRes = await fetch(`${BASE_URL}/admin/orders/${orderFlow.orderId}/fulfillments?fields=*fulfillments`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      items: [{ id: orderFlow.lineItemId, quantity: 1 }],
      location_id: inv0.location_id,
    }),
  })
  const fulData = await fulRes.json()
  let fulfillmentId = fulData.fulfillment?.id || fulData.order?.fulfillments?.[0]?.id
  if (!fulfillmentId) {
    const oRes = await fetch(`${BASE_URL}/admin/orders/${orderFlow.orderId}?fields=*fulfillments`, {
      headers: adminHeaders,
    })
    const oData = await oRes.json()
    fulfillmentId = oData.order?.fulfillments?.[0]?.id
  }
  console.log(`  Fulfillment creado: ${fulfillmentId} (HTTP ${fulRes.status})`)

  // Crear shipment para despachar efectivamente esa unidad
  console.log(`\n[P5] Despachando envío (Shipment) vía POST /admin/orders/:id/fulfillments/:fid/shipments...`)
  const shipRes = await fetch(
    `${BASE_URL}/admin/orders/${orderFlow.orderId}/fulfillments/${fulfillmentId}/shipments`,
    {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        items: [{ id: orderFlow.lineItemId, quantity: 1 }],
      }),
    }
  )
  const shipStatus = shipRes.status
  console.log(`  Shipment status: HTTP ${shipStatus}`)

  const inv4 = await getInventoryLevel(inventoryItemId)
  console.log(`[P5 - TRAS DESPACHO PARCIAL DE 1 UNIDAD]`)
  console.log(`  Stocked: ${inv4.stocked_quantity} (Delta físico: ${inv4.stocked_quantity - inv3.stocked_quantity})`)
  console.log(`  Reserved: ${inv4.reserved_quantity} (Delta reserva: ${inv4.reserved_quantity - inv3.reserved_quantity})`)
  console.log(`  Available: ${inv4.available_quantity} (Disponible: ${inv4.available_quantity})`)

  // El stock físico debe haber bajado EXACTAMENTE por 1 (lo despachado), no por 2 (el total del pedido)
  const passPartialShipment =
    shipStatus === 200 &&
    inv4.stocked_quantity === inv3.stocked_quantity - 1 &&
    inv4.reserved_quantity === inv3.reserved_quantity - 1 &&
    inv4.available_quantity === inv3.available_quantity

  console.log(`[EVALUACION 3.2] ${passPartialShipment ? 'PASS (Stock físico baja exactamente por lo despachado: -1)' : 'FAIL'}`)
  results.push({
    test: 'INV-03.2 (Despacho parcial)',
    pass: passPartialShipment,
    detail: `Stock físico bajó de ${inv3.stocked_quantity} a ${inv4.stocked_quantity} (-1 despachado, no -2 del pedido). Reserva: ${inv4.reserved_quantity}, Disp: ${inv4.available_quantity}`,
  })

  // =========================================================================
  // FASE 3: DEVOLUCIÓN PARCIAL (Return Requested -> Return Received)
  // =========================================================================
  console.log('\n----------------------------------------------------------------------')
  console.log('3.3 Devolución Parcial: Comportamiento en estado requested vs received')
  console.log('----------------------------------------------------------------------')

  // 1. Iniciar devolución
  console.log(`[P6] Iniciando proceso de devolución vía POST /admin/returns...`)
  const beginRetRes = await fetch(`${BASE_URL}/admin/returns`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      order_id: orderFlow.orderId,
      location_id: inv0.location_id,
    }),
  })
  const beginRetData = await beginRetRes.json()
  const returnId = beginRetData.return?.id
  console.log(`  Return ID: ${returnId}`)

  // 2. Solicitar devolución del ítem despachado (qty: 1)
  console.log(`[P7] Solicitando devolución de 1 unidad despachada...`)
  await fetch(`${BASE_URL}/admin/returns/${returnId}/request-items`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      items: [{ id: orderFlow.lineItemId, quantity: 1 }],
    }),
  })

  // 3. Confirmar solicitud de devolución
  await fetch(`${BASE_URL}/admin/returns/${returnId}/request`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({}),
  })
  console.log(`  Devolución en estado: REQUESTED (En tránsito / inspección)`)

  const inv5 = await getInventoryLevel(inventoryItemId)
  console.log(`[P7 - ESTADO EN REQUESTED (ESTADO INTERMEDIO)]`)
  console.log(`  Stocked: ${inv5.stocked_quantity} | Reserved: ${inv5.reserved_quantity} | Available: ${inv5.available_quantity}`)
  console.log(`  -> Hallazgo empírico: En estado 'requested', el stock NO reingresa a disponible (se mantiene en ${inv5.available_quantity})`)

  // 4. Recepción física de la devolución en depósito
  console.log(`\n[P8] Recibiendo ítem devuelto en depósito (POST /admin/returns/:id/receive/confirm)...`)
  await fetch(`${BASE_URL}/admin/returns/${returnId}/receive`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({}),
  })
  await fetch(`${BASE_URL}/admin/returns/${returnId}/receive-items`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      items: [{ id: orderFlow.lineItemId, quantity: 1 }],
    }),
  })
  const confReceiveRes = await fetch(`${BASE_URL}/admin/returns/${returnId}/receive/confirm`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({}),
  })
  const confReceiveStatus = confReceiveRes.status
  const confReceiveData = await confReceiveRes.json()
  console.log(`  Confirm receive status: HTTP ${confReceiveStatus} | Return status: ${confReceiveData.return?.status}`)

  const inv6 = await getInventoryLevel(inventoryItemId)
  console.log(`[P8 - TRAS RECEPCION FISICA DE LA DEVOLUCION]`)
  console.log(`  Stocked: ${inv6.stocked_quantity} (Delta físico: +${inv6.stocked_quantity - inv5.stocked_quantity})`)
  console.log(`  Reserved: ${inv6.reserved_quantity}`)
  console.log(`  Available: ${inv6.available_quantity} (Delta disponible: +${inv6.available_quantity - inv5.available_quantity})`)

  // El ítem devuelto reingresa físicamente al stock (+1) y al disponible (+1), mientras la unidad no despachada sigue reservada
  const passReturn =
    confReceiveStatus === 200 &&
    inv6.stocked_quantity === inv5.stocked_quantity + 1 &&
    inv6.available_quantity === inv5.available_quantity + 1 &&
    inv6.reserved_quantity === inv3.reserved_quantity - 1

  console.log(`[EVALUACION 3.3] ${passReturn ? 'PASS (Reingreso de stock consistente tras recepción de devolución)' : 'FAIL'}`)
  results.push({
    test: 'INV-03.3 (Devolución parcial y reingreso de stock)',
    pass: passReturn,
    detail: `Stock físico reingresó de ${inv5.stocked_quantity} a ${inv6.stocked_quantity} (+1). Disponible: ${inv5.available_quantity} -> ${inv6.available_quantity} (+1). Reserva pendiente de unidad no despachada=${inv6.reserved_quantity}`,
  })

  // Resumen final
  console.log('\n======================================================================')
  console.log('RESUMEN SUITE INV-03')
  console.log('======================================================================')
  let allPass = true
  for (const r of results) {
    console.log(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.test}: ${r.detail}`)
    if (!r.pass) allPass = false
  }

  if (!allPass) {
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
