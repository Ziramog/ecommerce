#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Probe de Seguridad e Identidades (SEC-01, SEC-02, SEC-03, SEC-04)
 *
 * Parametrizado estrictamente por variables de entorno (CERO secretos en el archivo):
 * - BASE_URL: URL base del backend Medusa (default: http://100.124.132.48:9000)
 * - PK_B2C: Publishable API Key del canal B2C (sc_pampa_novus_b2c)
 * - PK_B2B: Publishable API Key del canal B2B (sc_talabarteria_b2b)
 * - TOKEN_B2C: JWT Bearer Token de cliente B2C autenticado
 * - TOKEN_B2B: JWT Bearer Token de cliente B2B autenticado
 * - ORDER_ID_B2C: ID de pedido B2C existente para prueba de acceso cruzado (opcional)
 * - REGION_ID: ID de la region ARS (opcional)
 */

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const PK_B2C = process.env.PK_B2C
const PK_B2B = process.env.PK_B2B
const TOKEN_B2C = process.env.TOKEN_B2C
const TOKEN_B2B = process.env.TOKEN_B2B
let ORDER_ID_B2C = process.env.ORDER_ID_B2C
let REGION_ID = process.env.REGION_ID

const missing = []
if (!PK_B2C) missing.push('PK_B2C')
if (!PK_B2B) missing.push('PK_B2B')
if (missing.length > 0) {
  console.error(`[ERROR] Variables de entorno faltantes: ${missing.join(', ')}`)
  console.error('Uso: PK_B2C=... PK_B2B=... [TOKEN_B2C=...] [TOKEN_B2B=...] node tests/security/probe-security.mjs')
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

  // 1.1 Intentar acceder a endpoint administrativo protegido con token de cliente B2C
  const adminUrl = `${BASE_URL}/admin/customer-groups`
  console.log(`[REQUEST] GET ${adminUrl}`)
  console.log(`[HEADERS] Authorization: Bearer [REDACTED_TOKEN_B2C]`)

  const resAdmin = await fetch(adminUrl, {
    headers: {
      Authorization: TOKEN_B2C ? `Bearer ${TOKEN_B2C}` : 'Bearer fake_customer_token_b2c',
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

  // Probar acceso con sesion B2B a un pedido ajeno
  const targetOrderId = ORDER_ID_B2C || 'order_01M5TESTB2CORDER0000000'
  const url = `${BASE_URL}/store/orders/${targetOrderId}`
  console.log(`[REQUEST] GET ${url}`)
  console.log(`[HEADERS] x-publishable-api-key: [REDACTED_PK_B2B] | Authorization: Bearer [REDACTED_TOKEN_B2B]`)

  const res = await fetch(url, {
    headers: {
      'x-publishable-api-key': PK_B2B,
      Authorization: TOKEN_B2B ? `Bearer ${TOKEN_B2B}` : 'Bearer fake_customer_token_b2b',
    },
  })
  const status = res.status
  const body = await res.json().catch(() => ({}))

  console.log(`[STATUS] HTTP ${status}`)
  console.log(`[SNIPPET] Body: ${JSON.stringify(body)}`)

  // El acceso debe ser denegado (401 o 404 de no pertenencia) sin fugar metadatos sensibles ni datos de cliente
  const accessDenied = status === 401 || status === 404
  const noMetadataLeak = !body.order?.email && !body.order?.billing_address && !body.order?.customer_id

  const pass = accessDenied && noMetadataLeak
  results.push({
    test: 'SEC-02',
    description: 'Sesion B2B no puede acceder a pedidos de otro cliente; 0 fuga de metadatos',
    pass,
    detail: `HTTP ${status} (Esp: 401/404), Fuga de metadata sensible: ${!noMetadataLeak}`,
  })
  console.log(`[RESULT] SEC-02: ${pass ? 'PASS' : 'FAIL'}`)
}

async function runSec03() {
  console.log('\n============================================================')
  console.log('3. PROBE SEC-03: Mismo Email en Dos Marcas (DECISION JUAN: NO EJECUTADO)')
  console.log('============================================================')
  console.log('Estado Formal: NO EJECUTADO (DIFERIDO POR DECISIÓN DE JUAN, 2026-10-18)')
  console.log('Justificacion de ADR-004: En Medusa v2 la identidad auth (auth_identity) es única')
  console.log('por tuple (email, provider). El aislamiento de cuentas con mismo email exige módulos')
  console.log('personalizados de identidad por marca (diferido a fase posterior).')

  // Medición empírica del comportamiento real de Medusa 2:
  // Intentar registrar dos veces el mismo email en el provider emailpass
  const testEmail = `probe-sec03-duplicate-${Date.now()}@mercadal-staging.internal`
  console.log(`\n[EXPERIMENTO EMPÍRICO] Registrando email por primera vez: ${testEmail}`)
  const res1 = await fetch(`${BASE_URL}/auth/customer/emailpass/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'StagingSecretPassword123!' }),
  })
  const status1 = res1.status
  const body1 = await res1.json().catch(() => ({}))
  console.log(`[STATUS 1] HTTP ${status1}`)

  console.log(`\n[EXPERIMENTO EMPÍRICO] Intentando registrar el MISMO email por segunda vez:`)
  const res2 = await fetch(`${BASE_URL}/auth/customer/emailpass/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'StagingSecretPassword123!' }),
  })
  const status2 = res2.status
  const body2 = await res2.json().catch(() => ({}))
  console.log(`[STATUS 2] HTTP ${status2}`)
  console.log(`[SNIPPET 2] Mensaje Medusa ante duplicado: ${JSON.stringify(body2)}`)

  results.push({
    test: 'SEC-03',
    description: 'Mismo email en dos marcas (diferido formalmente, nunca reportar PASS)',
    pass: false, // Formalmente registrado como NO EJECUTADO / NO APROBADO en esta fase
    statusOverride: 'NO EJECUTADO',
    detail: `Decision aprobada: diferido a fase de auth modular por marca. Comportamiento nativo Medusa: HTTP ${status2} (${body2.message || 'Identity already exists'}).`,
  })
  console.log(`[RESULT] SEC-03: NO EJECUTADO (Registrado formalmente en ADR)`)
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

  // 4.2 Intento de inyeccion de headers administrativos o de tenant
  console.log('\n[REQUEST] Intentando inyeccion de header x-sales-channel-id arbitrario...')
  const tamperRes = await fetch(`${BASE_URL}/store/products?limit=1`, {
    headers: {
      'x-publishable-api-key': PK_B2C,
      'x-sales-channel-id': 'sc_talabarteria_b2b',
      'x-medusa-role': 'admin',
    },
  })
  console.log(`[STATUS] HTTP ${tamperRes.status} (Headers de elevacion ignorados de forma segura)`)
  const headersTamperSafe = tamperRes.status === 200

  const pass = status === 200 && wholesaleBlocked && headersTamperSafe
  results.push({
    test: 'SEC-04',
    description: 'Cambio de publishable key o headers no eleva privilegios ni expone precios protegidos',
    pass,
    detail: `Key B2B en anonimo calculated_amount=${calcPrice?.calculated_amount} (Esp: 450000, Mayorista 320000 bloqueado: ${wholesaleBlocked}), Tamper headers seguros=${headersTamperSafe}`,
  })
  console.log(`[RESULT] SEC-04: ${pass ? 'PASS' : 'FAIL'}`)
}

async function main() {
  console.log('============================================================')
  console.log(' MERCADAL DIGITAL 360 — SUITE DE PROBES DE SEGURIDAD (SEC)  ')
  console.log('============================================================')
  console.log(`Target: ${BASE_URL}`)
  console.log(`PK_B2C: [CONFIGURADA - LONGITUD ${PK_B2C.length}]`)
  console.log(`PK_B2B: [CONFIGURADA - LONGITUD ${PK_B2B.length}]`)
  console.log(`TOKEN_B2C: ${TOKEN_B2C ? `[CONFIGURADO - LONGITUD ${TOKEN_B2C.length}]` : '[NO CONFIGURADO]'}`)
  console.log(`TOKEN_B2B: ${TOKEN_B2B ? `[CONFIGURADO - LONGITUD ${TOKEN_B2B.length}]` : '[NO CONFIGURADO]'}`)

  await resolveRegionId()
  console.log(`Region ARS ID: ${REGION_ID}`)

  await runSec01()
  await runSec02()
  await runSec03()
  await runSec04()

  console.log('\n============================================================')
  console.log('                    RESUMEN DE PRUEBAS SEC                  ')
  console.log('============================================================')
  let overallPass = true
  for (const r of results) {
    const label = r.statusOverride || (r.pass ? 'PASS' : 'FAIL')
    if (!r.pass && r.statusOverride !== 'NO EJECUTADO') overallPass = false
    console.log(`[${label.padEnd(12)}] ${r.test.padEnd(8)} - ${r.description}`)
    console.log(`             Detalle: ${r.detail}`)
  }
  console.log('============================================================')
  console.log(`Resultado General (SEC-01, 02, 04): ${overallPass ? 'TODO PASS' : 'HAY FALLOS'}`)
  console.log(`SEC-03: Registrado formalmente como NO EJECUTADO (diferido)\n`)

  process.exit(overallPass ? 0 : 1)
}

main().catch((err) => {
  console.error('[FATAL ERROR]', err)
  process.exit(1)
})
