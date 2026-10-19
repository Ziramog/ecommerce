#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Probe de Precios B2B/B2C (PRICE-01, PRICE-02, PRICE-03)
 *
 * Parametrizado estrictamente por variables de entorno (CERO secretos en el archivo):
 * - BASE_URL: URL base del backend Medusa (default: http://100.124.132.48:9000)
 * - PK_B2C: Publishable API Key del canal B2C (sc_pampa_novus_b2c)
 * - PK_B2B: Publishable API Key del canal B2B (sc_talabarteria_b2b)
 * - TOKEN_B2B: JWT Bearer Token de cliente B2B autenticado perteneciente a cg_talabarteria_b2b
 * - REGION_ID: ID de la region ARS (opcional; si se omite, se resuelve dinamicamente)
 *
 * Salida:
 * Imprime por prueba: endpoint, status HTTP, fragmento sanitizado del cuerpo y estado PASS/FAIL.
 * Termina con resumen estructurado y exit code 0 (PASS) o 1 (FAIL).
 */

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const PK_B2C = process.env.PK_B2C
const PK_B2B = process.env.PK_B2B
const TOKEN_B2B = process.env.TOKEN_B2B
let REGION_ID = process.env.REGION_ID

// Validacion fail-closed de variables requeridas
const missing = []
if (!PK_B2C) missing.push('PK_B2C')
if (!PK_B2B) missing.push('PK_B2B')
if (missing.length > 0) {
  console.error(`[ERROR] Variables de entorno faltantes: ${missing.join(', ')}`)
  console.error('Uso: PK_B2C=... PK_B2B=... [TOKEN_B2B=...] node tests/price/probe-price.mjs')
  process.exit(1)
}

const SEED_CATALOG_EXPECTED = [
  { sku: 'SKU-CRI-001', handle: 'montura-criolla-de-trabajo', retail: 450000, wholesale: 320000, channels: ['b2c', 'b2b'] },
  { sku: 'SKU-DUAL-002', handle: 'bozal-cuero-crudo-trenzado', retail: 85000, wholesale: 55000, channels: ['b2c', 'b2b'] },
  { sku: 'SKU-B2C-003', handle: 'cinturon-carpincho-alpaca', retail: 120000, wholesale: null, channels: ['b2c'] },
  { sku: 'SKU-B2B-004', handle: 'rollo-lonja-vacuna-pack-x10', retail: 190000, wholesale: 190000, channels: ['b2b'] },
  { sku: 'SKU-DUAL-005', handle: 'estribos-chaquenos-acero-inoxidable', retail: 65000, wholesale: 42000, channels: ['b2c', 'b2b'] },
  { sku: 'SKU-DUAL-006', handle: 'cinchon-lona-reforzado-cuero-suela', retail: 38000, wholesale: 24000, channels: ['b2c', 'b2b'] },
  { sku: 'SKU-DUAL-007', handle: 'freno-criollo-cabeza-de-moro', retail: 95000, wholesale: 68000, channels: ['b2c', 'b2b'] },
  { sku: 'SKU-DUAL-008', handle: 'manta-sudadero-lana-pura', retail: 52000, wholesale: 35000, channels: ['b2c', 'b2b'] },
  { sku: 'SKU-DUAL-009', handle: 'cuchillo-criollo-vaina-repujada', retail: 110000, wholesale: 75000, channels: ['b2c', 'b2b'] },
  { sku: 'SKU-DUAL-010', handle: 'grasa-de-potro-cuero-500g', retail: 12000, wholesale: 7500, channels: ['b2c', 'b2b'] },
]

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
    throw new Error('No se encontro una region con currency_code=ars')
  }
  REGION_ID = arsRegion.id
  return REGION_ID
}

async function runPrice01() {
  console.log('\n============================================================')
  console.log('1. PROBE PRICE-01: Aislamiento de Precios Minoristas (B2C Anonimo)')
  console.log('============================================================')

  // 1.1 Consulta anónima de montura-criolla-de-trabajo (SKU-CRI-001)
  const url1 = `${BASE_URL}/store/products?handle=montura-criolla-de-trabajo&region_id=${REGION_ID}&fields=*variants.calculated_price`
  console.log(`[REQUEST] GET ${url1}`)
  console.log(`[HEADERS] x-publishable-api-key: [REDACTED_PK_B2C]`)

  const res1 = await fetch(url1, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  const status1 = res1.status
  const body1 = await res1.json()

  const product1 = body1.products?.[0]
  const variant1 = product1?.variants?.[0]
  const calcPrice1 = variant1?.calculated_price

  console.log(`[STATUS] HTTP ${status1}`)
  console.log(`[SNIPPET] Product: ${product1?.handle} | SKU: ${variant1?.sku}`)
  console.log(`[SNIPPET] Calculated Amount: ${calcPrice1?.calculated_amount} | Original: ${calcPrice1?.original_amount} | Is Price List: ${calcPrice1?.is_calculated_price_price_list}`)

  const p1Valid =
    status1 === 200 &&
    calcPrice1?.calculated_amount === 450000 &&
    calcPrice1?.is_calculated_price_price_list === false

  // 1.2 Exclusión de catálogo B2B en canal B2C (SKU-B2B-004)
  const url2 = `${BASE_URL}/store/products?handle=rollo-lonja-vacuna-pack-x10&region_id=${REGION_ID}`
  console.log(`\n[REQUEST] GET ${url2} (Validacion de exclusion de SKU B2B en B2C)`)
  const res2 = await fetch(url2, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  const body2 = await res2.json()
  const b2bInB2cCount = body2.products?.length ?? 0
  console.log(`[STATUS] HTTP ${res2.status} | Productos encontrados: ${b2bInB2cCount} (Esperado: 0)`)
  const b2bExcluded = res2.status === 200 && b2bInB2cCount === 0

  // 1.3 Caso negativo B2C exclusivo: SKU-B2C-003 no tiene precio de lista mayorista
  const url3 = `${BASE_URL}/store/products?handle=cinturon-carpincho-alpaca&region_id=${REGION_ID}&fields=*variants.calculated_price`
  console.log(`\n[REQUEST] GET ${url3} (Caso negativo B2C exclusivo SKU-B2C-003)`)
  const res3 = await fetch(url3, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  const body3 = await res3.json()
  const calcPrice3 = body3.products?.[0]?.variants?.[0]?.calculated_price
  console.log(`[STATUS] HTTP ${res3.status} | Calculated: ${calcPrice3?.calculated_amount} | Is Price List: ${calcPrice3?.is_calculated_price_price_list}`)
  const p3Valid = res3.status === 200 && calcPrice3?.calculated_amount === 120000 && calcPrice3?.is_calculated_price_price_list === false

  const pass = p1Valid && b2bExcluded && p3Valid
  results.push({
    test: 'PRICE-01',
    description: 'Peticion anonima B2C recibe solo precios minoristas y catalogo acotado',
    pass,
    detail: `SKU-CRI-001=${calcPrice1?.calculated_amount} (Esp: 450000, PriceList: ${calcPrice1?.is_calculated_price_price_list}), B2B-004 excluido=${b2bExcluded}, B2C-003=${calcPrice3?.calculated_amount}`,
  })
  console.log(`[RESULT] PRICE-01: ${pass ? 'PASS' : 'FAIL'}`)
}

async function runPrice02() {
  console.log('\n============================================================')
  console.log('2. PROBE PRICE-02: Precios Mayoristas para Cliente B2B Autenticado')
  console.log('============================================================')

  if (!TOKEN_B2B) {
    console.log('[SKIP] TOKEN_B2B no provisto. Omitiendo prueba de cliente autenticado B2B.')
    results.push({
      test: 'PRICE-02',
      description: 'Cliente B2B autenticado recibe precios mayoristas exactos sin escalas inventadas',
      pass: false,
      detail: 'Omitido por falta de TOKEN_B2B',
    })
    return
  }

  // Consultar catalogo completo como cliente B2B
  const url = `${BASE_URL}/store/products?limit=50&region_id=${REGION_ID}&fields=*variants.calculated_price`
  console.log(`[REQUEST] GET ${url}`)
  console.log(`[HEADERS] x-publishable-api-key: [REDACTED_PK_B2B] | Authorization: Bearer [REDACTED_TOKEN_B2B]`)

  const res = await fetch(url, {
    headers: {
      'x-publishable-api-key': PK_B2B,
      Authorization: `Bearer ${TOKEN_B2B}`,
    },
  })
  const status = res.status
  const body = await res.json()
  console.log(`[STATUS] HTTP ${status}`)

  const products = body.products || []
  const measuredBySku = new Map()
  for (const prod of products) {
    for (const v of prod.variants || []) {
      if (v.sku) {
        measuredBySku.set(v.sku, {
          sku: v.sku,
          handle: prod.handle,
          calculated_amount: v.calculated_price?.calculated_amount,
          original_amount: v.calculated_price?.original_amount,
          is_price_list: v.calculated_price?.is_calculated_price_price_list,
        })
      }
    }
  }

  console.log('\nComparacion Exhaustiva SKU x SKU contra Valores Seed (Region ARS):')
  console.log('SKU           | Handle                    | Base Retail | Seed Wholesale | Medido B2B  | PriceList? | Match?')
  console.log('--------------+---------------------------+-------------+----------------+-------------+------------+-------')

  let discrepancies = 0
  let evaluated = 0

  for (const spec of SEED_CATALOG_EXPECTED) {
    // Si el SKU no pertenece al canal B2B, no deberia estar visible en B2B
    if (!spec.channels.includes('b2b')) {
      const presentInB2B = measuredBySku.has(spec.sku)
      console.log(
        `${spec.sku.padEnd(13)} | ${spec.handle.padEnd(25)} | ${String(spec.retail).padStart(11)} | ${'N/A (B2C ONLY)'.padStart(14)} | ${(presentInB2B ? 'PRESENTE' : 'NO_VISIBLE').padStart(11)} | N/A        | ${presentInB2B ? 'FAIL (LEAK)' : 'PASS (EXCL)'}`
      )
      if (presentInB2B) discrepancies++
      continue
    }

    evaluated++
    const measured = measuredBySku.get(spec.sku)
    const expectedWholesale = spec.wholesale
    const measuredAmount = measured?.calculated_amount
    const isPriceList = measured?.is_price_list

    // Para SKU-B2B-004: retail = wholesale = 190000, pero Medusa v2 aplica la lista si coincide
    const matchesWholesale = measuredAmount === expectedWholesale
    const isWholesaleApplied = expectedWholesale !== spec.retail ? isPriceList === true : true

    const isMatch = matchesWholesale && isWholesaleApplied
    if (!isMatch) discrepancies++

    console.log(
      `${spec.sku.padEnd(13)} | ${spec.handle.padEnd(25)} | ${String(spec.retail).padStart(11)} | ${String(expectedWholesale).padStart(14)} | ${String(measuredAmount).padStart(11)} | ${String(isPriceList).padStart(10)} | ${isMatch ? 'PASS' : 'FAIL'}`
    )
  }

  const pass = status === 200 && discrepancies === 0 && evaluated >= 9
  results.push({
    test: 'PRICE-02',
    description: 'Cliente B2B autenticado recibe precios mayoristas exactos sin escalas inventadas',
    pass,
    detail: `Evaluados: ${evaluated} SKU B2B, Discrepancias: ${discrepancies}`,
  })
  console.log(`[RESULT] PRICE-02: ${pass ? 'PASS' : 'FAIL'}`)
}

async function runPrice03() {
  console.log('\n============================================================')
  console.log('3. PROBE PRICE-03: Prevencion de Inyeccion de Precios desde Cliente')
  console.log('============================================================')

  // Obtener variantId de SKU-CRI-001
  const prodRes = await fetch(
    `${BASE_URL}/store/products?handle=montura-criolla-de-trabajo&region_id=${REGION_ID}&fields=*variants`,
    { headers: { 'x-publishable-api-key': PK_B2C } }
  )
  const prodBody = await prodRes.json()
  const variantId = prodBody.products?.[0]?.variants?.[0]?.id

  if (!variantId) {
    throw new Error('No se pudo resolver variant_id para SKU-CRI-001')
  }

  // 3.1 Crear un carrito anonimo B2C
  const cartRes = await fetch(`${BASE_URL}/store/carts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2C,
    },
    body: JSON.stringify({
      region_id: REGION_ID,
      currency_code: 'ars',
    }),
  })
  const cartBody = await cartRes.json()
  const cartId = cartBody.cart?.id
  console.log(`[REQUEST] POST ${BASE_URL}/store/carts -> Created Cart: ${cartId}`)

  // 3.2 Inyectar linea de pedido con unit_price manipulado (1 ARS en vez de 450000)
  const injectionPayload = {
    variant_id: variantId,
    quantity: 1,
    unit_price: 1, // Intentar pagar 1 peso argentino
    amount: 1,
  }
  console.log(`[REQUEST] POST ${BASE_URL}/store/carts/${cartId}/line-items con precio manipulado a 1 ARS:`)
  console.log(`[PAYLOAD] ${JSON.stringify(injectionPayload)}`)

  const lineRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2C,
    },
    body: JSON.stringify(injectionPayload),
  })

  const lineStatus = lineRes.status
  const lineBody = await lineRes.json()

  console.log(`[STATUS] HTTP ${lineStatus}`)
  console.log(`[SNIPPET] Respuesta de rechazo por servidor: ${JSON.stringify(lineBody)}`)
  const injectionRejected = lineStatus === 400 && String(lineBody?.message).includes('unit_price')

  // 3.3 Agregar item sin manipulacion y verificar precio soberano del servidor
  console.log(`\n[REQUEST] POST ${BASE_URL}/store/carts/${cartId}/line-items con payload estandar:`)
  const standardRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PK_B2C,
    },
    body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
  })
  const stdStatus = standardRes.status
  const stdBody = await standardRes.json()
  const lineItem = stdBody.cart?.items?.find((i) => i.variant_id === variantId)

  console.log(`[STATUS] HTTP ${stdStatus}`)
  console.log(`[SNIPPET] Line Item ID: ${lineItem?.id} | Unit Price en servidor: ${lineItem?.unit_price} ARS`)

  const priceCalculatedByServer = stdStatus === 200 && lineItem?.unit_price === 450000

  // 3.4 Intentar forzar price list B2B por header o query parameter
  console.log('\n[REQUEST] Intentando forzar price list B2B via publishable key ajena con cart minorista...')
  const crossRes = await fetch(`${BASE_URL}/store/carts/${cartId}`, {
    headers: { 'x-publishable-api-key': PK_B2B },
  })
  const crossBody = await crossRes.json()
  const crossLineItem = crossBody.cart?.items?.find((i) => i.variant_id === variantId)
  const crossTamperResistant = crossLineItem?.unit_price === 450000

  const pass = injectionRejected && priceCalculatedByServer && crossTamperResistant
  results.push({
    test: 'PRICE-03',
    description: 'Inyeccion de precios en carrito rechazada (HTTP 400); servidor calcula precio soberano',
    pass,
    detail: `Inyeccion rechazada=${injectionRejected} (HTTP ${lineStatus}), Unit price calculado=${lineItem?.unit_price} (Esp: 450000), Cross-key tamper resistant=${crossTamperResistant}`,
  })
  console.log(`[RESULT] PRICE-03: ${pass ? 'PASS' : 'FAIL'}`)
}

async function runFieldLeakage() {
  console.log('\n============================================================')
  console.log('4. PROBE FUGA DE CAMPOS: Pedido B2C con fields=*variants.prices*')
  console.log('============================================================')

  const url = `${BASE_URL}/store/products?handle=montura-criolla-de-trabajo&region_id=${REGION_ID}&fields=*variants.prices`
  console.log(`[REQUEST] GET ${url}`)
  console.log(`[HEADERS] x-publishable-api-key: [REDACTED_PK_B2C]`)

  const res = await fetch(url, {
    headers: { 'x-publishable-api-key': PK_B2C },
  })
  const status = res.status
  const body = await res.json()
  const prices = body.products?.[0]?.variants?.[0]?.prices || []

  console.log(`[STATUS] HTTP ${status}`)
  console.log(`[SNIPPET] Precios crudos retornados en variantes: ${prices.length}`)

  // Verificar que NINGUNO de los precios devueltos pertenezca a la price list mayorista (320000)
  const wholesaleLeaked = prices.filter(
    (p) => p.amount === 320000 || (p.price_list_id && p.price_list_id.length > 0)
  )

  console.log(`[SNIPPET] Precios mayoristas filtrados en Store API: ${wholesaleLeaked.length} (Esperado: 0)`)
  const pass = status === 200 && wholesaleLeaked.length === 0

  results.push({
    test: 'PRICE-LEAK',
    description: 'Consulta Store API con fields crudos no fuga precios protegidos mayoristas',
    pass,
    detail: `Total precios retornados: ${prices.length}, Precios mayoristas fugados: ${wholesaleLeaked.length}`,
  })
  console.log(`[RESULT] PRICE-LEAK: ${pass ? 'PASS' : 'FAIL'}`)
}

async function main() {
  console.log('============================================================')
  console.log('  MERCADAL DIGITAL 360 — SUITE DE PROBES DE PRECIO (PRICE)  ')
  console.log('============================================================')
  console.log(`Target: ${BASE_URL}`)
  console.log(`PK_B2C: [CONFIGURADA - LONGITUD ${PK_B2C.length}]`)
  console.log(`PK_B2B: [CONFIGURADA - LONGITUD ${PK_B2B.length}]`)
  console.log(`TOKEN_B2B: ${TOKEN_B2B ? `[CONFIGURADO - LONGITUD ${TOKEN_B2B.length}]` : '[NO CONFIGURADO]'}`)

  await resolveRegionId()
  console.log(`Region ARS ID: ${REGION_ID}`)

  await runPrice01()
  await runPrice02()
  await runPrice03()
  await runFieldLeakage()

  console.log('\n============================================================')
  console.log('                    RESUMEN DE PRUEBAS PRICE                ')
  console.log('============================================================')
  let allPass = true
  for (const r of results) {
    if (!r.pass) allPass = false
    console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.test.padEnd(12)} - ${r.description}`)
    console.log(`       Detalle: ${r.detail}`)
  }
  console.log('============================================================')
  console.log(`Resultado General: ${allPass ? 'TODO PASS' : 'HAY FALLOS'}\n`)

  process.exit(allPass ? 0 : 1)
}

main().catch((err) => {
  console.error('[FATAL ERROR]', err)
  process.exit(1)
})
