#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Fixture Generator para SEC-02 (M360-011 / M360-012)
 *
 * Objetivo:
 * Garantizar la existencia de pedidos reales en Staging para el probe SEC-02 (aislamiento cross-tenant):
 * 1. Pedido B2C perteneciente a cliente-b2c-1 (Pampa Novus)
 * 2. Pedido B2B perteneciente a mayorista-b2b-1 (Talabartería Mercadal)
 *
 * Ambos pedidos se crean sobre SKUs no críticos (SKU-B2C-002 y SKU-DUAL-005) para no alterar
 * SKU-CRI-001.
 * Los IDs resultantes se almacenan en:
 * - VPS: $HOME/mercadal-staging/evidence/sec02-fixtures.env (permiso 600, sin tokens)
 * - VPS: $HOME/mercadal-staging/evidence/orders-inventory-m360-012.json (resumen sanitizado)
 */

import fs from 'node:fs'
import path from 'node:path'

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
  console.error(`[ERROR] Variables requeridas faltantes: ${missing.join(', ')}`)
  process.exit(1)
}

async function resolveRegion(publishableKey) {
  const res = await fetch(`${BASE_URL}/store/regions`, {
    headers: { 'x-publishable-api-key': publishableKey },
  })
  const data = await res.json()
  const reg = data.regions?.find((r) => r.currency_code === 'ars')
  if (!reg) throw new Error('Región ARS no encontrada')
  return reg.id
}

async function resolveVariant(publishableKey, handle) {
  const res = await fetch(`${BASE_URL}/store/products?handle=${handle}&fields=*variants`, {
    headers: { 'x-publishable-api-key': publishableKey },
  })
  const data = await res.json()
  const variant = data.products?.[0]?.variants?.[0]
  if (!variant) throw new Error(`Variante no encontrada para ${handle}`)
  return variant.id
}

async function createOrder({ publishableKey, token, handle, email, customerName }) {
  const regionId = await resolveRegion(publishableKey)
  const variantId = await resolveVariant(publishableKey, handle)

  const headers = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': publishableKey,
    Authorization: `Bearer ${token}`,
  }

  // 1. Carrito
  const cartRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      region_id: regionId,
      currency_code: 'ars',
      shipping_address: {
        first_name: customerName,
        last_name: 'Staging',
        address_1: 'Av. Libertador 1200',
        city: 'Buenos Aires',
        country_code: 'ar',
        postal_code: 'C1425',
      },
      email,
    }),
  })
  const cartData = await cartRes.json()
  const cartId = cartData.cart.id

  // 2. Línea
  await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
  })

  // 3. Shipping method
  const soRes = await fetch(`${BASE_URL}/store/shipping-options?cart_id=${cartId}`, {
    headers: { 'x-publishable-api-key': publishableKey },
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
  return compData.order
}

async function run() {
  console.log('======================================================================')
  console.log('PREPARACIÓN DE FIXTURES DE PEDIDOS REALES PARA SEC-02')
  console.log('======================================================================')

  // Obtener customer_id de B2C y B2B
  const custB2cRes = await fetch(`${BASE_URL}/store/customers/me`, {
    headers: { 'x-publishable-api-key': PK_B2C, Authorization: `Bearer ${TOKEN_B2C}` },
  })
  const custB2c = (await custB2cRes.json()).customer

  const custB2bRes = await fetch(`${BASE_URL}/store/customers/me`, {
    headers: { 'x-publishable-api-key': PK_B2B, Authorization: `Bearer ${TOKEN_B2B}` },
  })
  const custB2b = (await custB2bRes.json()).customer

  console.log(`Cliente B2C: ${custB2c.email} (ID: ${custB2c.id})`)
  console.log(`Cliente B2B: ${custB2b.email} (ID: ${custB2b.id})`)

  console.log('\nCreando pedido fixture B2C en Pampa Novus (SKU-B2C-003: cinturon-carpincho-alpaca)...')
  const orderB2C = await createOrder({
    publishableKey: PK_B2C,
    token: TOKEN_B2C,
    handle: 'cinturon-carpincho-alpaca',
    email: custB2c.email,
    customerName: 'Cliente B2C Fixture',
  })
  console.log(`-> Pedido B2C creado: ${orderB2C.id} | Status: ${orderB2C.status}`)

  console.log('\nCreando pedido fixture B2B en Talabartería (SKU-DUAL-005: estribos-chaquenos-acero-inoxidable)...')
  const orderB2B = await createOrder({
    publishableKey: PK_B2B,
    token: TOKEN_B2B,
    handle: 'estribos-chaquenos-acero-inoxidable',
    email: custB2b.email,
    customerName: 'Mayorista B2B Fixture',
  })
  console.log(`-> Pedido B2B creado: ${orderB2B.id} | Status: ${orderB2B.status}`)

  const fixtureEnvContent = [
    `# SEC-02 Fixtures generados por M360-012`,
    `# Generado: ${new Date().toISOString()}`,
    `ORDER_ID_B2C=${orderB2C.id}`,
    `CUSTOMER_ID_B2C=${custB2c.id}`,
    `ORDER_ID_B2B=${orderB2B.id}`,
    `CUSTOMER_ID_B2B=${custB2b.id}`,
    '',
  ].join('\n')

  const evidenceJson = {
    generated_at: new Date().toISOString(),
    b2c: {
      order_id: orderB2C.id,
      customer_id: custB2c.id,
      customer_email: custB2c.email,
      status: orderB2C.status,
      display_id: orderB2C.display_id,
      items: orderB2C.items?.map((it) => ({
        id: it.id,
        title: it.title,
        quantity: it.quantity,
        unit_price: it.unit_price,
      })),
    },
    b2b: {
      order_id: orderB2B.id,
      customer_id: custB2b.id,
      customer_email: custB2b.email,
      status: orderB2B.status,
      display_id: orderB2B.display_id,
      items: orderB2B.items?.map((it) => ({
        id: it.id,
        title: it.title,
        quantity: it.quantity,
        unit_price: it.unit_price,
      })),
    },
  }

  // Guardar localmente en evidencia si existe directorio
  const evidenceDir = path.resolve(process.env.HOME || process.env.USERPROFILE, 'mercadal-staging/evidence')
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true })
  }

  const envFilePath = path.join(evidenceDir, 'sec02-fixtures.env')
  const jsonFilePath = path.join(evidenceDir, 'orders-inventory-m360-012.json')

  fs.writeFileSync(envFilePath, fixtureEnvContent, { mode: 0o600 })
  fs.writeFileSync(jsonFilePath, JSON.stringify(evidenceJson, null, 2), { mode: 0o600 })

  console.log(`\nArchivos guardados exitosamente:`)
  console.log(`- ${envFilePath} (modo 600)`)
  console.log(`- ${jsonFilePath} (modo 600)`)
  console.log('\n[ÉXITO] Fixtures para SEC-02 listos y preservados.')
}

run().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
