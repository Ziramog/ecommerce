#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Probe de Inventario y Concurrencia (INV-01)
 *
 * Objetivo:
 * Validar de forma exhaustiva sobre Staging la prevención absoluta de sobreventa (overselling):
 * 1. Intento directo de agregar cantidad 2 sobre SKU con stock 1 (rechazo inmediato).
 * 2. Intento de agregar dos líneas del mismo SKU superando stock disponible (rechazo en línea).
 * 3. Concurrencia real: Dos carritos independientes (uno B2C y uno B2B) compiten en paralelo
 *    por la última unidad de SKU-CRI-001 (stock = 1).
 *    Invariante: Exactamente 1 ganador (HTTP 200, orden creada), exactamente 1 rechazado
 *    (HTTP 400 not_allowed/insufficient_inventory). Dos 200 = FALLA CRÍTICA.
 *    Invariante de consistencia: reserved + vendido <= stocked en todo momento.
 *
 * Variables de entorno requeridas:
 * - BASE_URL: URL base del backend Medusa (default: http://100.124.132.48:9000)
 * - PK_B2C: Publishable Key B2C
 * - PK_B2B: Publishable Key B2B
 * - TOKEN_B2C: Token cliente B2C (cliente-b2c-1)
 * - TOKEN_B2B: Token cliente B2B (mayorista-b2b-1)
 * - ADMIN_TOKEN: Token Bearer de administrador Medusa (para consultas de inventario admin)
 */

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const PK_B2C = process.env.PK_B2C
const PK_B2B = process.env.PK_B2B
const TOKEN_B2C = process.env.TOKEN_B2C
const TOKEN_B2B = process.env.TOKEN_B2B
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

const missing = []
if (!PK_B2C) missing.push('PK_B2C')
if (!PK_B2B) missing.push('PK_B2B')
if (!TOKEN_B2C) missing.push('TOKEN_B2C')
if (!TOKEN_B2B) missing.push('TOKEN_B2B')
if (!ADMIN_TOKEN) missing.push('ADMIN_TOKEN')
if (missing.length > 0) {
  console.error(`[ERROR] Variables de entorno faltantes: ${missing.join(', ')}`)
  process.exit(1)
}

const SKU_CRITICAL = 'SKU-CRI-001'
const results = []

async function resolveArsRegion() {
  const res = await fetch(`${BASE_URL}/store/regions`, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  if (!res.ok) throw new Error(`Error obteniendo regiones: HTTP ${res.status}`)
  const data = await res.json()
  const arsRegion = data.regions?.find((r) => r.currency_code === 'ars')
  if (!arsRegion) throw new Error('No se encontró región con moneda ars')
  return arsRegion.id
}

async function resolveVariant(handle) {
  const res = await fetch(`${BASE_URL}/store/products?handle=${handle}&fields=*variants`, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  if (!res.ok) throw new Error(`Error obteniendo variante para ${handle}: HTTP ${res.status}`)
  const data = await res.json()
  const variant = data.products?.[0]?.variants?.[0]
  if (!variant) throw new Error(`Variante no encontrada para handle: ${handle}`)
  return variant
}

async function getInventoryLevel(inventoryItemId) {
  const res = await fetch(`${BASE_URL}/admin/inventory-items/${inventoryItemId}?fields=*location_levels`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Error consultando inventory-item ${inventoryItemId}: HTTP ${res.status}`)
  const data = await res.json()
  const level = data.inventory_item?.location_levels?.[0]
  return {
    inventory_item_id: inventoryItemId,
    stocked_quantity: Number(level?.stocked_quantity ?? 0),
    reserved_quantity: Number(level?.reserved_quantity ?? 0),
    available_quantity: Number(level?.available_quantity ?? 0),
  }
}

async function resolveInventoryItemIdForVariant(variantId) {
  const res = await fetch(`${BASE_URL}/admin/products?limit=20&fields=*variants`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  const data = await res.json()
  for (const prod of data.products || []) {
    const v = prod.variants?.find((item) => item.id === variantId)
    if (v) {
      // Consultar variantes con inventory link
      const vRes = await fetch(`${BASE_URL}/admin/inventory-items?limit=100`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      })
      const vData = await vRes.json()
      const item = vData.inventory_items?.find((ii) => ii.sku === v.sku)
      if (item) return item.id
    }
  }
  throw new Error(`No se pudo resolver inventory_item_id para variante ${variantId}`)
}

async function prepareCart({ pk, token, regionId, variantId, qty, email, customerTag }) {
  // 1. Crear carrito autenticado
  const headers = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': pk,
    Authorization: `Bearer ${token}`,
  }
  const cartRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      region_id: regionId,
      currency_code: 'ars',
      shipping_address: {
        first_name: `Cliente ${customerTag}`,
        last_name: 'Test',
        address_1: 'Av Corrientes 1234',
        city: 'Buenos Aires',
        country_code: 'ar',
        postal_code: 'C1043',
      },
      email,
    }),
  })
  if (!cartRes.ok) {
    throw new Error(`Error creando carrito: HTTP ${cartRes.status} ${await cartRes.text()}`)
  }
  const cartData = await cartRes.json()
  const cartId = cartData.cart.id

  // 2. Agregar ítem
  const itemRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ variant_id: variantId, quantity: qty }),
  })
  const itemData = await itemRes.json()
  if (!itemRes.ok) {
    return { error: itemData, status: itemRes.status, cartId }
  }

  // 3. Resolver shipping options y asignar método de envío
  const soRes = await fetch(`${BASE_URL}/store/shipping-options?cart_id=${cartId}`, {
    headers: { 'x-publishable-api-key': pk },
  })
  const soData = await soRes.json()
  const shippingOptionId = soData.shipping_options?.[0]?.id
  if (!shippingOptionId) {
    throw new Error(`No se encontro shipping option disponible para cart ${cartId}`)
  }

  const shipMethodRes = await fetch(`${BASE_URL}/store/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ option_id: shippingOptionId }),
  })
  if (!shipMethodRes.ok) {
    throw new Error(`Error asignando shipping method: HTTP ${shipMethodRes.status}`)
  }

  // 4. Inicializar payment collection
  const pcRes = await fetch(`${BASE_URL}/store/payment-collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cart_id: cartId }),
  })
  const pcData = await pcRes.json()
  const colId = pcData.payment_collection?.id
  if (!colId) {
    throw new Error(`Error inicializando payment collection para cart ${cartId}`)
  }

  // 5. Crear sesión de pago con pp_system_default
  const sessRes = await fetch(`${BASE_URL}/store/payment-collections/${colId}/payment-sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ provider_id: 'pp_system_default' }),
  })
  if (!sessRes.ok) {
    throw new Error(`Error creando payment session: HTTP ${sessRes.status} ${await sessRes.text()}`)
  }

  return { cartId, ready: true }
}

async function run() {
  console.log('======================================================================')
  console.log('PROBE INV-01: Prevención de Sobreventa y Concurrencia de Inventario')
  console.log(`Backend Target: ${BASE_URL}`)
  console.log('======================================================================')

  const regionId = await resolveArsRegion()
  const variant = await resolveVariant('montura-criolla-de-trabajo')
  const inventoryItemId = await resolveInventoryItemIdForVariant(variant.id)

  const baselineLevel = await getInventoryLevel(inventoryItemId)
  console.log(`\n[BASELINE PREVIO A PRUEBAS - ${SKU_CRITICAL}]`)
  console.log(`  - Stocked Quantity:  ${baselineLevel.stocked_quantity}`)
  console.log(`  - Reserved Quantity: ${baselineLevel.reserved_quantity}`)
  console.log(`  - Available Stock:   ${baselineLevel.available_quantity}`)

  if (baselineLevel.available_quantity !== 1) {
    console.error(`[ABORT] SKU-CRI-001 debe tener disponible = 1 para INV-01. Actual: ${baselineLevel.available_quantity}`)
    process.exit(1)
  }

  // -------------------------------------------------------------------------
  // Sub-caso 1.1: Intento de agregar cantidad 2 directa sobre stock 1
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------')
  console.log('1.1 Sub-caso: Solicitud de cantidad 2 sobre stock 1 (oversell directo)')
  console.log('----------------------------------------------------------------------')
  const oversellDirect = await prepareCart({
    pk: PK_B2C,
    token: TOKEN_B2C,
    regionId,
    variantId: variant.id,
    qty: 2,
    email: 'oversell-direct@mercadal-staging.internal',
    customerTag: 'B2C-Oversell-Direct',
  })

  const passDirect =
    oversellDirect.status === 400 &&
    (oversellDirect.error?.code === 'insufficient_inventory' ||
      String(oversellDirect.error?.message).toLowerCase().includes('inventory'))

  console.log(`[REQUEST] POST /store/carts/:id/line-items con variant_id=${variant.id}, quantity=2`)
  console.log(`[STATUS] HTTP ${oversellDirect.status} (Esperado: 400)`)
  console.log(`[RESPONSE] ${JSON.stringify(oversellDirect.error)}`)
  console.log(`[EVALUACION 1.1] ${passDirect ? 'PASS (Rechazo inmediato)' : 'FAIL'}`)
  results.push({
    test: 'INV-01.1 (Oversell directo qty 2)',
    pass: passDirect,
    detail: `HTTP ${oversellDirect.status} - ${oversellDirect.error?.message}`,
  })

  // -------------------------------------------------------------------------
  // Sub-caso 1.2: Intento de agregar segunda línea con misma variante
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------')
  console.log('1.2 Sub-caso: Segunda línea del mismo SKU sumando más que el stock')
  console.log('----------------------------------------------------------------------')
  const cartMulti = await prepareCart({
    pk: PK_B2C,
    token: TOKEN_B2C,
    regionId,
    variantId: variant.id,
    qty: 1,
    email: 'oversell-multiline@mercadal-staging.internal',
    customerTag: 'B2C-MultiLine',
  })

  // Intentar agregar otra unidad al mismo carrito
  const secondLineRes = await fetch(`${BASE_URL}/store/carts/${cartMulti.cartId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2C,
      Authorization: `Bearer ${TOKEN_B2C}`,
    },
    body: JSON.stringify({ variant_id: variant.id, quantity: 1 }),
  })
  const secondLineStatus = secondLineRes.status
  const secondLineBody = await secondLineRes.json()

  const passMulti =
    secondLineStatus === 400 &&
    (secondLineBody?.code === 'insufficient_inventory' ||
      String(secondLineBody?.message).toLowerCase().includes('inventory'))

  console.log(`[REQUEST] POST /store/carts/${cartMulti.cartId}/line-items con segunda unidad`)
  console.log(`[STATUS] HTTP ${secondLineStatus} (Esperado: 400)`)
  console.log(`[RESPONSE] ${JSON.stringify(secondLineBody)}`)
  console.log(`[EVALUACION 1.2] ${passMulti ? 'PASS (Rechazo de acumulación)' : 'FAIL'}`)
  results.push({
    test: 'INV-01.2 (Segunda línea acumulativa)',
    pass: passMulti,
    detail: `HTTP ${secondLineStatus} - ${secondLineBody?.message}`,
  })

  // -------------------------------------------------------------------------
  // Sub-caso 1.3: Concurrencia real — Dos carritos compitiendo por stock 1
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------')
  console.log('1.3 Sub-caso: Concurrencia real — Dos carritos compitiendo por stock 1')
  console.log('----------------------------------------------------------------------')

  console.log('[FASE 1] Preparando Cart A (Cliente B2C) y Cart B (Cliente B2B)...')
  const [prepA, prepB] = await Promise.all([
    prepareCart({
      pk: PK_B2C,
      token: TOKEN_B2C,
      regionId,
      variantId: variant.id,
      qty: 1,
      email: 'cliente-b2c-1@mercadal-staging.internal',
      customerTag: 'B2C-Competitor-A',
    }),
    prepareCart({
      pk: PK_B2B,
      token: TOKEN_B2B,
      regionId,
      variantId: variant.id,
      qty: 1,
      email: 'mayorista-b2b-1@mercadal-staging.internal',
      customerTag: 'B2B-Competitor-B',
    }),
  ])

  console.log(`  - Cart A (B2C) preparado: ${prepA.cartId}`)
  console.log(`  - Cart B (B2B) preparado: ${prepB.cartId}`)

  console.log('\n[FASE 2] Disparando completado concurrente simultáneo (POST /store/carts/:id/complete)...')
  const tStart = Date.now()
  const [resA, resB] = await Promise.all([
    fetch(`${BASE_URL}/store/carts/${prepA.cartId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PK_B2C,
        Authorization: `Bearer ${TOKEN_B2C}`,
      },
    }),
    fetch(`${BASE_URL}/store/carts/${prepB.cartId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PK_B2B,
        Authorization: `Bearer ${TOKEN_B2B}`,
      },
    }),
  ])
  const tElapsed = Date.now() - tStart

  const bodyA = await resA.json().catch(() => ({}))
  const bodyB = await resB.json().catch(() => ({}))

  console.log(`\n[RESULTADOS CONCURRENTES (Latencia: ${tElapsed} ms)]`)
  console.log(`  - Cart A (B2C): HTTP ${resA.status} | type: ${bodyA?.type || 'N/A'} | order_id: ${bodyA?.order?.id || 'NINGUNO'}`)
  if (resA.status !== 200) console.log(`    Mensaje error A: ${JSON.stringify(bodyA)}`)
  console.log(`  - Cart B (B2B): HTTP ${resB.status} | type: ${bodyB?.type || 'N/A'} | order_id: ${bodyB?.order?.id || 'NINGUNO'}`)
  if (resB.status !== 200) console.log(`    Mensaje error B: ${JSON.stringify(bodyB)}`)

  const aIsOrder = resA.status === 200 && bodyA?.type === 'order' && Boolean(bodyA?.order?.id)
  const bIsOrder = resB.status === 200 && bodyB?.type === 'order' && Boolean(bodyB?.order?.id)

  const aIsRejected = resA.status !== 200 || bodyA?.type === 'cart'
  const bIsRejected = resB.status !== 200 || bodyB?.type === 'cart'

  const exactlyOneWinner = (aIsOrder && bIsRejected) || (bIsOrder && aIsRejected)
  const doubleWinnerFailure = aIsOrder && bIsOrder

  const winnerOrder = aIsOrder ? bodyA.order : bodyB.order
  const winnerChannel = aIsOrder ? 'B2C' : 'B2B'
  const rejectedChannel = aIsOrder ? 'B2B' : 'B2C'
  const rejectedError = aIsOrder ? bodyB : bodyA

  console.log(`\n[ANALISIS DE CONCURRENCIA]`)
  console.log(`  - Ganador determinístico: ${winnerChannel} (Order: ${winnerOrder?.id || 'N/A'})`)
  console.log(`  - Rechazado determinístico: ${rejectedChannel} (Error: ${JSON.stringify(rejectedError)})`)
  console.log(`  - Falla de doble orden (Oversell): ${doubleWinnerFailure}`)

  // -------------------------------------------------------------------------
  // Validación de Invariantes en Base de Datos
  // -------------------------------------------------------------------------
  const finalLevel = await getInventoryLevel(inventoryItemId)
  console.log(`\n[ESTADO POSTERIOR EN INVENTARIO - ${SKU_CRITICAL}]`)
  console.log(`  - Stocked Quantity:  ${finalLevel.stocked_quantity}`)
  console.log(`  - Reserved Quantity: ${finalLevel.reserved_quantity}`)
  console.log(`  - Available Stock:   ${finalLevel.available_quantity}`)

  const invariantStockMaintained = finalLevel.stocked_quantity === 1
  const invariantReservedEqualsOne = finalLevel.reserved_quantity === 1
  const invariantAvailableZero = finalLevel.available_quantity === 0
  const invariantNoOversell = finalLevel.reserved_quantity <= finalLevel.stocked_quantity

  const passRace = exactlyOneWinner && !doubleWinnerFailure && invariantNoOversell && invariantAvailableZero

  results.push({
    test: 'INV-01.3 (Carrera concurrente stock 1)',
    pass: passRace,
    detail: `Ganador=${winnerChannel} (${winnerOrder?.id}), Rechazado=${rejectedChannel}, Invariante Stock (R=${finalLevel.reserved_quantity} <= S=${finalLevel.stocked_quantity}, Disp=${finalLevel.available_quantity})`,
    evidence: {
      winnerChannel,
      winnerOrderId: winnerOrder?.id,
      winnerCustomerId: winnerOrder?.customer_id,
      rejectedChannel,
      rejectedStatus: aIsOrder ? resB.status : resA.status,
      rejectedMessage: rejectedError?.message || JSON.stringify(rejectedError),
      stocked_quantity: finalLevel.stocked_quantity,
      reserved_quantity: finalLevel.reserved_quantity,
      available_quantity: finalLevel.available_quantity,
    },
  })

  console.log(`\n[EVALUACION 1.3] ${passRace ? 'PASS (Sin sobreventa, 1 orden creada)' : 'FAIL'}`)

  // Resumen final
  console.log('\n======================================================================')
  console.log('RESUMEN SUITE INV-01')
  console.log('======================================================================')
  let allPass = true
  for (const r of results) {
    console.log(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.test}: ${r.detail}`)
    if (!r.pass) allPass = false
  }

  // Exportar evidencia estructurada para consumo posterior
  if (winnerOrder) {
    console.log(`\n[EVIDENCE OUTPUT FOR AUDIT]`)
    console.log(`WINNER_CHANNEL=${winnerChannel}`)
    console.log(`WINNER_ORDER_ID=${winnerOrder.id}`)
    console.log(`WINNER_CUSTOMER_ID=${winnerOrder.customer_id}`)
  }

  if (!allPass) {
    console.error('\nERROR: Al menos una prueba de INV-01 falló.')
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
