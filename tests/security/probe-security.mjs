#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Probe de Seguridad e Identidades con Procedencia Criptografica
 * SEC-01, SEC-02, SEC-03, SEC-04
 *
 * CRITERIO DE PROCEDENCIA OBLIGATORIO (FAIL-CLOSED):
 * - REPO_HEAD: Commit SHA del repositorio (git rev-parse HEAD)
 * - PROBE_BLOB: SHA del blob de git o SHA-256 del archivo ejecutado
 * - IMAGE_TAG: Tag de la imagen viva en Docker (e.g. mercadal-staging-medusa:2.21.2-f8eb4d7)
 * - IMAGE_REVISION_LABEL: Label org.opencontainers.image.revision del contenedor
 * - IMAGE_DIGEST: Digest sha256 inmutable de la imagen viva
 * Si falta cualquiera de estos metadatos, el probe aborta inmediatamente (exit code 1).
 *
 * Parametrizado estrictamente por variables de entorno (CERO secretos en el archivo):
 * - BASE_URL: URL base del backend Medusa (default: http://100.124.132.48:9000)
 * - PK_B2C: Publishable API Key del canal B2C (sc_pampa_novus_b2c)
 * - PK_B2B: Publishable API Key del canal B2B (sc_talabarteria_b2b)
 * - TOKEN_B2C: JWT Bearer Token de cliente B2C autenticado
 * - TOKEN_B2B: JWT Bearer Token de cliente B2B autenticado
 * - ORDER_ID_B2C: ID de pedido B2C existente para prueba de acceso cruzado (requerido para desbloquear SEC-02)
 * - ORDER_ID_B2B: ID de pedido B2B propio para prueba de acceso cruzado (requerido para desbloquear SEC-02)
 * - REGION_ID: ID de la region ARS (opcional)
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

function resolveProvenance() {
  const currentFilePath = fileURLToPath(import.meta.url)

  let repoHead = process.env.REPO_HEAD
  if (!repoHead) {
    try {
      repoHead = execSync('git rev-parse HEAD', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()
    } catch {}
  }

  let probeBlob = process.env.PROBE_BLOB
  if (!probeBlob) {
    try {
      const gitBlob = execSync(`git hash-object "${currentFilePath}"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()
      if (gitBlob) probeBlob = `git:${gitBlob}`
    } catch {}
    if (!probeBlob) {
      try {
        const fileContent = fs.readFileSync(currentFilePath)
        const sha256 = crypto.createHash('sha256').update(fileContent).digest('hex')
        probeBlob = `sha256:${sha256}`
      } catch {}
    }
  }

  const imageTag = process.env.IMAGE_TAG
  const imageRevisionLabel = process.env.IMAGE_REVISION_LABEL
  const imageDigest = process.env.IMAGE_DIGEST

  const missing = []
  if (!repoHead) missing.push('REPO_HEAD')
  if (!probeBlob) missing.push('PROBE_BLOB')
  if (!imageTag) missing.push('IMAGE_TAG')
  if (!imageRevisionLabel) missing.push('IMAGE_REVISION_LABEL')
  if (!imageDigest) missing.push('IMAGE_DIGEST')

  if (missing.length > 0) {
    console.error('============================================================')
    console.error('[PROVENANCE FAIL-CLOSED] Faltan metadatos de procedencia obligatorios:')
    for (const m of missing) {
      console.error(`  - ${m}`)
    }
    console.error('El probe aborta inmediatamente. No es posible emitir veredicto sin procedencia.')
    console.error('Inyectar via entorno: REPO_HEAD, PROBE_BLOB, IMAGE_TAG, IMAGE_REVISION_LABEL, IMAGE_DIGEST.')
    console.error('============================================================')
    process.exit(1)
  }

  return {
    repoHead,
    probeBlob,
    imageTag,
    imageRevisionLabel,
    imageDigest,
  }
}

// =========================================================================
// ALLOWLIST ESTRICTA Y HARNESS DE DETECCION DE FUGAS (GET-ONLY)
// =========================================================================

// Allowlist estricta de campos permitidos en un cuerpo de error autenticado de la Store API (HTTP 403 / 404)
const ALLOWED_ERROR_KEYS = new Set(['message', 'type', 'code'])

// Campos prohibidos asociados a entidades de orden, cliente, totales, items, direcciones o metadata
const FORBIDDEN_LEAK_KEYS = new Set([
  'order', 'id', 'total', 'totals', 'subtotal', 'tax_total', 'discount_total', 'original_total',
  'items', 'line_items', 'shipping_address', 'billing_address', 'address', 'addresses',
  'customer', 'customer_id', 'email', 'phone', 'metadata', 'payments', 'payment_collections',
  'shipping_methods', 'fulfillments', 'sales_channel_id', 'region_id', 'currency_code'
])

export function validateNoLeakStrictAllowlist(node, path = '') {
  if (node === null || typeof node !== 'object') {
    return { valid: true }
  }

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const res = validateNoLeakStrictAllowlist(node[i], `${path}[${i}]`)
      if (!res.valid) return res
    }
    return { valid: true }
  }

  for (const [key, val] of Object.entries(node)) {
    const fullPath = path ? `${path}.${key}` : key
    const lowerKey = key.toLowerCase()

    if (FORBIDDEN_LEAK_KEYS.has(lowerKey)) {
      return {
        valid: false,
        reason: `Campo prohibido de orden/cliente detectado en cuerpo de error: '${fullPath}'`,
      }
    }

    if (!ALLOWED_ERROR_KEYS.has(lowerKey)) {
      return {
        valid: false,
        reason: `Campo no admitido en allowlist estricta de error: '${fullPath}'`,
      }
    }

    if (typeof val === 'object' && val !== null) {
      const sub = validateNoLeakStrictAllowlist(val, fullPath)
      if (!sub.valid) return sub
    }
  }

  return { valid: true }
}

function runSecurityLeakHarness() {
  console.log('[SECURITY HARNESS] Ejecutando autoverificacion del validador de allowlist estricta...')

  // Caso 1: Error limpio estándar de Medusa -> DEBE ser aceptado
  const cleanBody = { type: 'not_found', message: 'Order id not found: order_01M5...' }
  const resClean = validateNoLeakStrictAllowlist(cleanBody)
  if (!resClean.valid) {
    throw new Error(`[SECURITY HARNESS FAILURE] Error limpio fue rechazado indebidamente: ${resClean.reason}`)
  }

  // Caso 2: Fugas sintéticas simuladas en respuesta HTTP GET (403 con datos de orden o cliente) -> DEBEN ser detectadas
  const leakPayloads = [
    { type: 'not_allowed', message: 'Forbidden', order: { id: 'order_123', total: 450000 } },
    { message: 'Denied', email: 'victima@mercadal-staging.internal' },
    { type: 'not_found', message: 'Not found', items: [{ id: 'item_1', title: 'Montura' }] },
    { code: 'unauthorized', shipping_address: { city: 'Buenos Aires' } },
    { type: 'not_allowed', message: 'Denied', metadata: { internal_notes: 'vip' } },
    { type: 'not_allowed', message: 'Denied', custom_unknown_field: 'leak' },
  ]

  for (const leak of leakPayloads) {
    const resLeak = validateNoLeakStrictAllowlist(leak)
    if (resLeak.valid) {
      throw new Error(`[SECURITY HARNESS FAILURE] Fuga inyectada no fue detectada: ${JSON.stringify(leak)}`)
    }
  }

  console.log('[SECURITY HARNESS] PASS: El validador recursivo rechazo el 100% de las fugas inyectadas.')
}

// Ejecutar autoverificacion de harness inmediatamente
runSecurityLeakHarness()

// Si se invoco con bandera de prueba de harness negativo, forzar salida exit 1 comprobada
if (process.argv.includes('--test-leak-harness')) {
  console.log('[HARNESS TEST MODE] Simulando recepcion de cuerpo con fuga en peticion GET...')
  const simulatedLeakedBody = {
    type: 'not_allowed',
    message: 'Access denied',
    order: { id: 'order_victim_01M5', total: 450000 },
  }
  const check = validateNoLeakStrictAllowlist(simulatedLeakedBody)
  if (!check.valid) {
    console.error(`[HARNESS TEST SUCCESS] Fuga detectada y bloqueada exitosamente: ${check.reason}`)
    console.error('[HARNESS TEST] Saliendo con exit code 1 conforme a la especificacion.')
    process.exit(1)
  }
}

const provenance = resolveProvenance()

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const PK_B2C = process.env.PK_B2C
const PK_B2B = process.env.PK_B2B
const TOKEN_B2C = process.env.TOKEN_B2C
const TOKEN_B2B = process.env.TOKEN_B2B
let REGION_ID = process.env.REGION_ID

// Validacion fail-closed de credenciales: cero fallbacks a tokens falsos
const missingVars = []
if (!PK_B2C) missingVars.push('PK_B2C')
if (!PK_B2B) missingVars.push('PK_B2B')
if (!TOKEN_B2C) missingVars.push('TOKEN_B2C')
if (!TOKEN_B2B) missingVars.push('TOKEN_B2B')
if (missingVars.length > 0) {
  console.error(`[ERROR] Variables de entorno requeridas faltantes: ${missingVars.join(', ')}`)
  console.error('Uso: PK_B2C=... PK_B2B=... TOKEN_B2C=... TOKEN_B2B=... node tests/security/probe-security.mjs')
  process.exit(1)
}

const results = []

async function resolveRegionId() {
  if (REGION_ID) return REGION_ID
  const res = await fetch(`${BASE_URL}/store/regions`, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  if (!res.ok) {
    throw new Error(`Error resolviendo regiones: HTTP ${res.status}`)
  }
  const data = await res.json()
  const arsRegion = data.regions?.find((r) => r.currency_code === 'ars')
  if (!arsRegion) {
    throw new Error('No se encontro region ARS')
  }
  REGION_ID = arsRegion.id
  return REGION_ID
}

async function runSec01() {
  console.log('\n============================================================')
  console.log('1. PROBE SEC-01: Control de Acceso y Aislamiento de Privilegios B2C vs B2B')
  console.log('============================================================')

  // 1.1 Intentar acceder a endpoint administrativo protegido con token real de cliente B2C
  const adminUrl = `${BASE_URL}/admin/customer-groups`
  console.log(`[REQUEST] GET ${adminUrl}`)
  console.log(`[HEADERS] Authorization: Bearer [REDACTED_TOKEN_B2C]`)

  const resAdmin = await fetch(adminUrl, {
    headers: {
      Authorization: `Bearer ${TOKEN_B2C}`,
    },
  })
  const statusAdmin = resAdmin.status
  const bodyAdmin = await resAdmin.json().catch(() => ({}))

  console.log(`[STATUS] HTTP ${statusAdmin}`)
  console.log(`[SNIPPET] Body: ${JSON.stringify(bodyAdmin)}`)

  // El acceso debe ser denegado estrictamente con 401 Unauthorized sin stack traces
  const adminDenied = statusAdmin === 401 && !JSON.stringify(bodyAdmin).includes('stack')

  // 1.2 Registro formal de endpoints B2B futuros (Cotizaciones / RFQ de F4)
  console.log('\n[SURFACE AUDIT] Endpoints B2B de Cotizaciones / RFQ:')
  console.log('  - Estado en F2: No forman parte de la superficie de endpoints de Medusa 2.21.2 base.')
  console.log('  - Decision de diseño: Cotizaciones mayoristas corresponden a Milestone F4 (M360-014).')
  console.log('  - Registro formal: SUPERFICIE NO IMPLEMENTADA EN F2 (Diferido a F4).')

  const pass = adminDenied
  results.push({
    test: 'SEC-01',
    description: 'Token B2C no puede acceder a datos ni rutas protegidas administrativas/B2B',
    pass,
    detail: `Acceso admin denegado con HTTP ${statusAdmin} (Esp: 401), Stack trace filtrado: ${JSON.stringify(bodyAdmin).includes('stack')}`,
  })
  console.log(`[RESULT] SEC-01: ${pass ? 'PASS' : 'FAIL'}`)
}

async function runSec02() {
  console.log('\n============================================================')
  console.log('2. PROBE SEC-02: Aislamiento Estricto de Pedidos entre Clientes')
  console.log('============================================================')

  const ORDER_ID_B2C = process.env.ORDER_ID_B2C
  const ORDER_ID_B2B = process.env.ORDER_ID_B2B

  // Gate fail-closed: Si no se proveen pedidos reales existentes, reportar BLOCKED / NO EJECUTADO
  if (!ORDER_ID_B2C || !ORDER_ID_B2B) {
    console.log('[BLOCKED / NO EJECUTADO] Se requiere ORDER_ID_B2C y ORDER_ID_B2B para validar aislamiento real de pedidos.')
    console.log('  La base de datos de Staging contiene 0 pedidos; probar un ID sintetico arrojaria un 404 trivial no representativo.')
    console.log('  Criterio autoritativo: Bloqueado hasta recibir pedidos reales generados en M360-012. Jamas envolver en PASS.')
    results.push({
      test: 'SEC-02',
      description: 'Sesion B2B no puede acceder a pedidos de otro cliente; 0 fuga de metadatos',
      pass: false,
      statusOverride: 'BLOCKED / NO EJECUTADO',
      detail: 'Bloqueado: La base de datos tiene 0 pedidos. Requiere ORDER_ID_B2C y ORDER_ID_B2B con pedidos reales de M360-012 para probar pertenencia sin 404 trivial. Gate F2 permanece abierto.',
    })
    console.log('[RESULT] SEC-02: BLOCKED / NO EJECUTADO (Registrado formalmente; Gate F2 abierto)')
    return
  }

  // 2.1 Consultar pedido PROPIO con token B2B -> Debe responder 200 OK
  const urlOwn = `${BASE_URL}/store/orders/${ORDER_ID_B2B}`
  console.log(`[REQUEST] GET ${urlOwn} (Pedido PROPIO B2B)`)
  const resOwn = await fetch(urlOwn, {
    headers: {
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
  })
  const statusOwn = resOwn.status
  const bodyOwn = await resOwn.json().catch(() => ({}))
  console.log(`[STATUS] HTTP ${statusOwn}`)
  const ownOrderOk = statusOwn === 200 && bodyOwn.order?.id === ORDER_ID_B2B

  // 2.2 Consultar pedido AJENO (B2C) con token B2B -> Debe responder 404 o 403 y NO fugar metadata
  const urlForeign = `${BASE_URL}/store/orders/${ORDER_ID_B2C}`
  console.log(`\n[REQUEST] GET ${urlForeign} (Pedido AJENO B2C consultado con sesion B2B)`)
  const resForeign = await fetch(urlForeign, {
    headers: {
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
  })
  const statusForeign = resForeign.status
  const bodyForeign = await resForeign.json().catch(() => ({}))
  console.log(`[STATUS] HTTP ${statusForeign}`)
  console.log(`[SNIPPET] Body ajeno: ${JSON.stringify(bodyForeign)}`)

  const foreignDenied = statusForeign === 404 || statusForeign === 403

  // Aplicar validacion de allowlist estricta recursiva al cuerpo de error recibido
  const allowlistCheck = validateNoLeakStrictAllowlist(bodyForeign)
  if (!allowlistCheck.valid) {
    console.error(`[LEAK DETECTED] ${allowlistCheck.reason}`)
  }

  const pass = ownOrderOk && foreignDenied && allowlistCheck.valid
  results.push({
    test: 'SEC-02',
    description: 'Sesion B2B no puede acceder a pedidos de otro cliente; 0 fuga de metadatos',
    pass,
    detail: `Pedido propio HTTP ${statusOwn} (Esp: 200), Pedido ajeno HTTP ${statusForeign} (Esp: 404/403), Allowlist estricta valida: ${allowlistCheck.valid}`,
  })
  console.log(`[RESULT] SEC-02: ${pass ? 'PASS' : 'FAIL'}`)
}

async function runSec03() {
  console.log('\n============================================================')
  console.log('3. PROBE SEC-03: Mismo Email en Dos Marcas (DECISION JUAN: NO EJECUTADO)')
  console.log('============================================================')
  console.log('Estado Formal: NO EJECUTADO (DIFERIDO POR DECISIÓN DE JUAN, 2026-10-18)')
  console.log('Fundamento Arquitectonico (ADR-004):')
  console.log('  En Medusa 2.21.2 la entidad de autenticacion (auth_identity) es unica por la tupla (email, provider).')
  console.log('  Registrar un mismo email en ambas marcas no genera cuentas ni historiales aislados, sino que')
  console.log('  reutiliza la misma auth_identity global devolviendo el mismo token JWT.')
  console.log('  La separacion de cuentas para un mismo email requiere modulos de auth modular multi-marca (diferido a fase posterior).')
  console.log('  Conforme a la directiva de auditoria, no se ejecutan registros redundantes en Staging.')

  results.push({
    test: 'SEC-03',
    description: 'Mismo email en dos marcas (diferido formalmente, unica excepcion no-bloqueante aprobada)',
    pass: false,
    statusOverride: 'NO EJECUTADO',
    detail: 'DIFERIDO POR DECISIÓN DE JUAN (2026-10-18): Medusa 2.21.2 mantiene auth_identity unica por (email, provider). No se ejecutan registros en staging. Cuentas separadas con mismo email diferidas a fase de auth modular.',
  })
  console.log('[RESULT] SEC-03: NO EJECUTADO (Registrado formalmente en ADR-004)')
}

async function runSec04() {
  console.log('\n============================================================')
  console.log('4. PROBE SEC-04: Resistencia a Elevacion de Privilegios y Cambio de Headers')
  console.log('============================================================')

  // 4.1 Peticion anonima usando la publishable key B2B (pk_talabarteria_b2b)
  // El atacante anónimo obtiene la key B2B e intenta ver los precios mayoristas protegidos
  const url = `${BASE_URL}/store/products?handle=montura-criolla-de-trabajo&region_id=${REGION_ID}&fields=*variants.calculated_price`
  console.log(`[REQUEST] GET ${url} con publishable key B2B desde contexto ANONIMO:`)
  console.log(`[HEADERS] x-publishable-api-key: [REDACTED_PK_B2B]`)

  const res = await fetch(url, {
    headers: { 'x-publishable-api-key': PK_B2B },
  })
  const status = res.status
  const body = await res.json()
  const calcPrice = body.products?.[0]?.variants?.[0]?.calculated_price

  console.log(`[STATUS] HTTP ${status}`)
  console.log(`[SNIPPET] Amount calculado: ${calcPrice?.calculated_amount} | Original: ${calcPrice?.original_amount} | Is Price List: ${calcPrice?.is_calculated_price_price_list}`)

  // DEBE SER el precio base (450000), NUNCA el mayorista (320000), y is_calculated_price_price_list debe ser FALSE
  const wholesaleBlocked = calcPrice?.calculated_amount === 450000 && calcPrice?.is_calculated_price_price_list === false

  // 4.2 Intento de inyeccion de headers administrativos, de tenant o de grupo de cliente
  console.log('\n[REQUEST] Intentando inyeccion de headers arbitrarios (x-sales-channel-id, x-medusa-role, x-customer-group)...')
  const tamperUrl = `${BASE_URL}/store/products?region_id=${REGION_ID}&fields=id,handle,*variants.calculated_price`
  const tamperRes = await fetch(tamperUrl, {
    headers: {
      'x-publishable-api-key': PK_B2C,
      'x-sales-channel-id': 'sc_talabarteria_b2b',
      'x-medusa-role': 'admin',
      'x-customer-group': 'cg_talabarteria_b2b',
    },
  })
  const tamperStatus = tamperRes.status
  const tamperBody = await tamperRes.json()
  const tamperProducts = tamperBody.products || []

  console.log(`[STATUS] HTTP ${tamperStatus}`)
  console.log(`[SNIPPET] Total productos retornados en peticion manipulada: ${tamperProducts.length}`)

  // Verificar que el cuerpo no contenga precios mayoristas ni datos protegidos:
  // 1. SKU B2B exclusivo (rollo-lonja-vacuna-pack-x10) NO debe estar presente (prueba que el sales channel no cambio)
  const b2bProductLeaked = tamperProducts.some((p) => p.handle === 'rollo-lonja-vacuna-pack-x10')

  // 2. Para cada producto devuelto, ningun calculated_amount debe ser precio mayorista ni tener is_calculated_price_price_list = true
  let wholesalePricesFoundInTamper = 0
  for (const p of tamperProducts) {
    for (const v of p.variants || []) {
      if (v.calculated_price?.is_calculated_price_price_list === true) {
        wholesalePricesFoundInTamper++
      }
      if (p.handle === 'montura-criolla-de-trabajo' && v.calculated_price?.calculated_amount === 320000) {
        wholesalePricesFoundInTamper++
      }
    }
  }

  console.log(`[SNIPPET] B2B-only producto filtrado por headers: ${b2bProductLeaked ? 'SI (FUGA)' : 'NO (PROTEGIDO)'}`)
  console.log(`[SNIPPET] Precios de price list mayorista en cuerpo: ${wholesalePricesFoundInTamper} (Esperado: 0)`)

  const headersTamperSafe =
    tamperStatus === 200 &&
    !b2bProductLeaked &&
    wholesalePricesFoundInTamper === 0

  const pass = status === 200 && wholesaleBlocked && headersTamperSafe
  results.push({
    test: 'SEC-04',
    description: 'Cambio de publishable key o headers no eleva privilegios ni expone precios protegidos',
    pass,
    detail: `Key B2B en anonimo calculated_amount=${calcPrice?.calculated_amount} (Esp: 450000, Mayorista 320000 bloqueado: ${wholesaleBlocked}), Tamper headers seguros: no B2B leaks=${!b2bProductLeaked}, wholesale in body=${wholesalePricesFoundInTamper}`,
  })
  console.log(`[RESULT] SEC-04: ${pass ? 'PASS' : 'FAIL'}`)
}

async function main() {
  console.log('============================================================')
  console.log(' MERCADAL DIGITAL 360 — SUITE DE PROBES DE SEGURIDAD (SEC)  ')
  console.log('============================================================')
  console.log('CRITERIO DE PROCEDENCIA Y TRAZABILIDAD (GATE F2):')
  console.log(`  - REPO_HEAD:            ${provenance.repoHead}`)
  console.log(`  - PROBE_BLOB:           ${provenance.probeBlob}`)
  console.log(`  - IMAGE_TAG:            ${provenance.imageTag}`)
  console.log(`  - IMAGE_REVISION_LABEL: ${provenance.imageRevisionLabel}`)
  console.log(`  - IMAGE_DIGEST:         ${provenance.imageDigest}`)
  console.log('------------------------------------------------------------')
  console.log(`Target: ${BASE_URL}`)
  console.log(`PK_B2C: [CONFIGURADA - LONGITUD ${PK_B2C.length}]`)
  console.log(`PK_B2B: [CONFIGURADA - LONGITUD ${PK_B2B.length}]`)
  console.log(`TOKEN_B2C: [CONFIGURADO - LONGITUD ${TOKEN_B2C.length}]`)
  console.log(`TOKEN_B2B: [CONFIGURADO - LONGITUD ${TOKEN_B2B.length}]`)

  await resolveRegionId()
  console.log(`Region ARS ID: ${REGION_ID}`)

  await runSec01()
  await runSec02()
  await runSec03()
  await runSec04()

  console.log('\n============================================================')
  console.log('                    RESUMEN DE PRUEBAS SEC                  ')
  console.log('============================================================')
  let executedPass = true
  let hasBlocked = false

  for (const r of results) {
    const isSec03 = r.test === 'SEC-03' // Unica excepcion no-bloqueante aprobada
    const isBlocked = r.statusOverride && r.statusOverride.includes('BLOCKED')

    if (isBlocked) {
      hasBlocked = true
      executedPass = false
    } else if (!r.pass && !isSec03) {
      executedPass = false
    }

    const label = r.statusOverride || (r.pass ? 'PASS' : 'FAIL')
    console.log(`[${label.padEnd(24)}] ${r.test.padEnd(8)} - ${r.description}`)
    console.log(`                         Detalle: ${r.detail}`)
  }
  const sec01 = results.find(r => r.test === 'SEC-01')
  const sec02 = results.find(r => r.test === 'SEC-02')
  const sec04 = results.find(r => r.test === 'SEC-04')
  const sec02Label = sec02?.statusOverride || (sec02?.pass ? 'PASS' : 'FAIL')

  console.log('============================================================')
  console.log(`Procedencia Certificada: REPO_HEAD=${provenance.repoHead} | IMAGE=${provenance.imageTag}`)
  console.log(`Superficie Ejecutada: SEC-01=${sec01?.pass ? 'PASS' : 'FAIL'} | SEC-02=${sec02Label} | SEC-04=${sec04?.pass ? 'PASS' : 'FAIL'}`)
  console.log(`SEC-03: NO EJECUTADO (Diferido formalmente por decision de Juan, unica excepcion no-bloqueante)`)
  if (!hasBlocked && executedPass) {
    console.log(`ESTADO TICKET M360-011 / GATE F2: PASS (Aprobado)\n`)
  } else {
    console.log(`ESTADO TICKET M360-011 / GATE F2: REVIEW-BLOCKED (Abierto hasta ejecucion de SEC-02 real)\n`)
  }

  if (hasBlocked || !executedPass) {
    console.log('[FAIL-CLOSED] Saliendo con codigo 1: Se encontraron pruebas fallidas o bloqueadas.')
    process.exit(1)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('[FATAL ERROR]', err)
  process.exit(1)
})
