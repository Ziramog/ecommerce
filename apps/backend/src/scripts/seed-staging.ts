/**
 * Mercadal Digital 360 — Seed Idempotente Staging (B4/B5 de M360-010)
 *
 * Configuración comercial e inventario unificado de prueba (10 SKU):
 * - 2 Sales Channels: sc_pampa_novus_b2c y sc_talabarteria_b2b
 * - 1 Ubicación lógica única de stock: loc_digital_warehouse (asociada a ambos canales)
 * - 2 Publishable API Keys: 1 por marca/canal, 0 compartidas
 * - 1 Región ARS (país: ar) y 1 Perfil de envío estándar
 * - 10 SKU determinísticos con inventario digital conocido (incluyendo SKU con stock = 1 para concurrencia)
 * - Price List para precios mayoristas diferenciados B2B
 *
 * Guardas de Seguridad Fail-Closed:
 * - Exige MERCADAL_SEED_ENV=staging y ALLOW_DESTRUCTIVE_SEED=true para ejecutar.
 * - Clasificación estricta pre-flight: sólo se permite sanear artefactos exactos conocidos del starter
 *   (handles t-shirt/sweatshirt/sweatpants/shorts, Default Sales Channel, European Warehouse, Default Publishable API Key).
 * - Si se detecta cualquier entidad ajena/desconocida, aborta inmediatamente sin mutaciones.
 * - Umbrales máximos de saneamiento para evitar borrados masivos imprevistos.
 *
 * Ejecución dentro del contenedor:
 *   MERCADAL_SEED_ENV=staging ALLOW_DESTRUCTIVE_SEED=true npx medusa exec ./src/scripts/seed-staging.ts
 */
import {
  createSalesChannelsWorkflow,
  deleteSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  deleteStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createApiKeysWorkflow,
  revokeApiKeysWorkflow,
  deleteApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  createRegionsWorkflow,
  createShippingProfilesWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  createInventoryLevelsWorkflow,
  updateInventoryLevelsWorkflow,
  createPriceListsWorkflow,
  updateStoresWorkflow,
} from '@medusajs/medusa/core-flows'
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'
import {
  classifyAndValidatePreflight,
  KNOWN_STARTER_CHANNELS,
  KNOWN_STARTER_LOCATIONS,
  KNOWN_STARTER_KEYS,
  KNOWN_STARTER_PRODUCTS,
  MAX_STARTER_CHANNELS_TO_DELETE,
  MAX_STARTER_LOCATIONS_TO_DELETE,
  MAX_STARTER_KEYS_TO_DELETE,
  MAX_STARTER_PRODUCTS_TO_DELETE,
  MERCADAL_CHANNELS,
  MERCADAL_LOCATIONS,
  MERCADAL_KEYS,
  MERCADAL_PRODUCT_HANDLES,
  type PreflightInput,
  type PreflightClassificationResult,
  type RawPreflightChannel,
  type RawPreflightLocation,
  type RawPreflightKey,
  type RawPreflightProduct,
  type SanitizationItem,
} from './seed-preflight'

export {
  classifyAndValidatePreflight,
  KNOWN_STARTER_CHANNELS,
  KNOWN_STARTER_LOCATIONS,
  KNOWN_STARTER_KEYS,
  KNOWN_STARTER_PRODUCTS,
  MAX_STARTER_CHANNELS_TO_DELETE,
  MAX_STARTER_LOCATIONS_TO_DELETE,
  MAX_STARTER_KEYS_TO_DELETE,
  MAX_STARTER_PRODUCTS_TO_DELETE,
  MERCADAL_CHANNELS,
  MERCADAL_LOCATIONS,
  MERCADAL_KEYS,
  MERCADAL_PRODUCT_HANDLES,
  type PreflightInput,
  type PreflightClassificationResult,
  type RawPreflightChannel,
  type RawPreflightLocation,
  type RawPreflightKey,
  type RawPreflightProduct,
  type SanitizationItem,
}

// Entidades de Dominio Mercadal Digital 360
const CHANNEL_B2C = 'sc_pampa_novus_b2c'
const CHANNEL_B2B = 'sc_talabarteria_b2b'
const STOCK_LOCATION_NAME = 'loc_digital_warehouse'
const KEY_TITLE_B2C = 'pk_pampa_novus_b2c'
const KEY_TITLE_B2B = 'pk_talabarteria_b2b'
const B2B_PRICE_LIST_TITLE = 'Lista Mayorista Talabarteria B2B'

interface SeedProductSpec {
  sku: string
  title: string
  handle: string
  description: string
  targetStock: number
  channels: ('b2c' | 'b2b')[]
  retailPrice?: number // en ARS (minorista / precio base variante)
  wholesalePrice?: number // en ARS (mayorista / price list B2B)
  testCase: string
}

const SEED_PRODUCTS: SeedProductSpec[] = [
  {
    // CASO 1: SKU con stock = 1 (insumo de INV-01, prueba crítica de concurrencia y prevención de sobreventa)
    sku: 'SKU-CRI-001',
    title: 'Montura Criolla de Trabajo en Suela',
    handle: 'montura-criolla-de-trabajo',
    description: 'Montura criolla artesanal confeccionada en cuero vacuno curtido al tanino con bastos rellenos de cerda natural.',
    targetStock: 1,
    channels: ['b2c', 'b2b'],
    retailPrice: 450000,
    wholesalePrice: 320000,
    testCase: 'Stock = 1 (insumo de INV-01, prueba de concurrencia)',
  },
  {
    // CASO 2: SKU compartido entre ambos canales (prueba de catálogo común e inventario digital unificado)
    sku: 'SKU-DUAL-002',
    title: 'Bozal de Cuero Crudo Trenzado 8 Cabos',
    handle: 'bozal-cuero-crudo-trenzado',
    description: 'Bozal criollo tradicional tejido a mano en tiento de cuero crudo seleccionado con testera y ahogador reforzados.',
    targetStock: 25,
    channels: ['b2c', 'b2b'],
    retailPrice: 85000,
    wholesalePrice: 55000,
    testCase: 'Compartido dual B2C y B2B (inventario unificado)',
  },
  {
    // CASO 3: SKU exclusivo canal B2C (prueba de aislamiento de canal minorista Pampa Novus)
    sku: 'SKU-B2C-003',
    title: 'Cinturon de Carpincho con Pasador de Alpaca',
    handle: 'cinturon-carpincho-alpaca',
    description: 'Cinturon de cuero de carpincho legitimo con forreria de badana y pasador artesanal cincelado en alpaca.',
    targetStock: 15,
    channels: ['b2c'],
    retailPrice: 120000,
    wholesalePrice: undefined,
    testCase: 'Exclusivo B2C Pampa Novus (aislamiento de canal)',
  },
  {
    // CASO 4: SKU exclusivo canal B2B (prueba de aislamiento de canal mayorista Talabarteria Mercadal)
    sku: 'SKU-B2B-004',
    title: 'Rollo de Lonja Vacuna Curtida para Sogueo (Pack x10)',
    handle: 'rollo-lonja-vacuna-pack-x10',
    description: 'Pack mayorista de 10 rollos de lonja seleccionada de 25mm para trabajos de sogueo y guarnicioneria profesional.',
    targetStock: 50,
    channels: ['b2b'],
    retailPrice: undefined,
    wholesalePrice: 190000,
    testCase: 'Exclusivo B2B Talabarteria Mercadal (aislamiento de canal)',
  },
  {
    // CASO 5: SKU compartido, stock medio
    sku: 'SKU-DUAL-005',
    title: 'Estribos Chaquenos de Acero Inoxidable',
    handle: 'estribos-chaquenos-acero-inoxidable',
    description: 'Par de estribos campana forjados en acero inoxidable 304 pulido espejo, pisada antideslizante estriada.',
    targetStock: 30,
    channels: ['b2c', 'b2b'],
    retailPrice: 65000,
    wholesalePrice: 42000,
    testCase: 'Compartido dual, stock medio',
  },
  {
    // CASO 6: SKU compartido, stock alto
    sku: 'SKU-DUAL-006',
    title: 'Cinchon de Lona Reforzado y Traba Cuero Suela',
    handle: 'cinchon-lona-reforzado-cuero-suela',
    description: 'Cinchon ancho de lona pesada de 12cm con pasadores y lengueta en cuero suela de 4mm, hebilla doble rodillo.',
    targetStock: 100,
    channels: ['b2c', 'b2b'],
    retailPrice: 38000,
    wholesalePrice: 24000,
    testCase: 'Compartido dual, stock alto',
  },
  {
    // CASO 7: SKU compartido, stock medio
    sku: 'SKU-DUAL-007',
    title: 'Freno Criollo Cabeza de Moro Forjado',
    handle: 'freno-criollo-cabeza-de-moro',
    description: 'Freno tradicional pata curva forjado en hierro dulce con coscojas sonoras y barbada de cadena calibrada.',
    targetStock: 20,
    channels: ['b2c', 'b2b'],
    retailPrice: 95000,
    wholesalePrice: 68000,
    testCase: 'Compartido dual, stock medio',
  },
  {
    // CASO 8: SKU compartido, stock variado
    sku: 'SKU-DUAL-008',
    title: 'Manta Sudadero de Lana Pura de Oveja',
    handle: 'manta-sudadero-lana-pura',
    description: 'Manta telar de lana virgen de oveja hilada a mano, alta capacidad de absorcion y proteccion del lomo equino.',
    targetStock: 40,
    channels: ['b2c', 'b2b'],
    retailPrice: 52000,
    wholesalePrice: 35000,
    testCase: 'Compartido dual, stock variado',
  },
  {
    // CASO 9: SKU compartido, stock bajo
    sku: 'SKU-DUAL-009',
    title: 'Cuchillo Criollo con Vaina Repujada Artesanal',
    handle: 'cuchillo-criollo-vaina-repujada',
    description: 'Cuchillo de campo hoja de 16cm en acero al carbono 1070 con cabo de guampa de ciervo y vaina repujada a mano.',
    targetStock: 8,
    channels: ['b2c', 'b2b'],
    retailPrice: 110000,
    wholesalePrice: 75000,
    testCase: 'Compartido dual, stock bajo',
  },
  {
    // CASO 10: SKU compartido, alta rotacion consumible
    sku: 'SKU-DUAL-010',
    title: 'Grasa de Potro Filtrada para Cuidado de Cuero (500g)',
    handle: 'grasa-de-potro-cuero-500g',
    description: 'Compuesto acondicionador e impermeabilizante a base de grasa de potro purificada, cera de abejas y aceites naturales.',
    targetStock: 200,
    channels: ['b2c', 'b2b'],
    retailPrice: 12000,
    wholesalePrice: 7500,
    testCase: 'Compartido dual, alta rotacion consumible',
  },
]

export default async function seedStaging({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // =========================================================================
  // GUARDA 1: CONTROL DE ENTORNO FAIL-CLOSED OBLIGATORIO
  // =========================================================================
  const isStagingEnv = process.env.MERCADAL_SEED_ENV === 'staging'
  const allowDestructive = process.env.ALLOW_DESTRUCTIVE_SEED === 'true'

  if (!isStagingEnv || !allowDestructive) {
    const missingFlags: string[] = []
    if (!isStagingEnv) missingFlags.push('MERCADAL_SEED_ENV=staging')
    if (!allowDestructive) missingFlags.push('ALLOW_DESTRUCTIVE_SEED=true')

    logger.error(
      `[FAIL-CLOSED GUARD] Abortando ejecucion de seed antes de cualquier mutacion. ` +
      `Se requieren ambas banderas explicitas: ${missingFlags.join(', ')}. ` +
      `Nota: el contenedor corre en NODE_ENV=production, por lo que se exige confirmacion de entorno deliberada.`
    )
    throw new Error(
      `[FAIL-CLOSED GUARD] Ejecucion abortada por falta de banderas requeridas: ${missingFlags.join(', ')}`
    )
  }

  logger.info('[FAIL-CLOSED GUARD] Banderas de entorno validadas: MERCADAL_SEED_ENV=staging, ALLOW_DESTRUCTIVE_SEED=true.')
  logger.info('Iniciando pre-flight audit y clasificacion de entidades...')

  // Obtener usuario administrador existente para created_by en API Keys
  const { data: users } = await query.graph({
    entity: 'user',
    fields: ['id', 'email'],
  })
  const adminUserId = users[0]?.id ?? 'admin'

  // =========================================================================
  // GUARDA 2 & 3: PRE-FLIGHT AUDIT & UMBRALES — INVOCACIÓN DE FUNCIÓN PURA
  // =========================================================================
  const { data: preflightChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
  })
  const { data: preflightLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
  })
  const { data: preflightKeys } = await query.graph({
    entity: 'api_key',
    fields: ['id', 'title'],
    filters: { type: 'publishable' },
  })
  const { data: preflightProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'title'],
  })

  // Ejecuta clasificación contra whitelist, detección de desconocidos/nulos y umbrales
  const {
    channelsToDelete,
    locationsToDelete,
    keysToDelete,
    productsToDelete,
  } = classifyAndValidatePreflight({
    channels: preflightChannels,
    locations: preflightLocations,
    keys: preflightKeys,
    products: preflightProducts,
  })

  logger.info(
    `[PLAN DE SANEAMIENTO STARTER AUTORIZADO]\n` +
    `  - Canales de starter a purgar (${channelsToDelete.length}): ${
      channelsToDelete.map((c) => `[ID:${c.id} | Nombre:${c.name}]`).join(', ') || 'ninguno'
    }\n` +
    `  - Ubicaciones de starter a purgar (${locationsToDelete.length}): ${
      locationsToDelete.map((l) => `[ID:${l.id} | Nombre:${l.name}]`).join(', ') || 'ninguno'
    }\n` +
    `  - Claves de starter a purgar (${keysToDelete.length}): ${
      keysToDelete.map((k) => `[ID:${k.id} | Titulo:${k.title}]`).join(', ') || 'ninguno'
    }\n` +
    `  - Productos de starter a purgar (${productsToDelete.length}): ${
      productsToDelete.map((p) => `[ID:${p.id} | Handle:${p.handle} | Titulo:${p.title || 'N/A'}]`).join(', ') || 'ninguno'
    }`
  )

  const mercadalProductHandles = new Set(SEED_PRODUCTS.map((p) => p.handle))

  // =========================================================================
  // 1. SALES CHANNELS (sc_pampa_novus_b2c y sc_talabarteria_b2b)
  // =========================================================================
  const { data: initialChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
  })

  let pampaChannelId = initialChannels.find((sc) => sc.name === CHANNEL_B2C)?.id
  if (!pampaChannelId) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: CHANNEL_B2C,
            description: 'Canal minorista B2C Pampa Novus (Retail Premium)',
          },
        ],
      },
    })
    pampaChannelId = result[0].id
    logger.info(`Creado canal de ventas: ${CHANNEL_B2C} (${pampaChannelId})`)
  }

  let talaChannelId = initialChannels.find((sc) => sc.name === CHANNEL_B2B)?.id
  if (!talaChannelId) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: CHANNEL_B2B,
            description: 'Canal mayorista B2B Talabarteria Mercadal (Mayorista Privado)',
          },
        ],
      },
    })
    talaChannelId = result[0].id
    logger.info(`Creado canal de ventas: ${CHANNEL_B2B} (${talaChannelId})`)
  }

  // Asegurar que el store tenga como default sales channel a pampaChannel
  const { data: currentStores } = await query.graph({
    entity: 'store',
    fields: ['id', 'default_sales_channel_id', 'supported_currencies.currency_code'],
  })
  const defaultStore = currentStores[0]
  if (defaultStore && defaultStore.default_sales_channel_id !== pampaChannelId) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: defaultStore.id },
        update: { default_sales_channel_id: pampaChannelId },
      },
    })
  }

  // Purgar únicamente canales de starter clasificados en pre-flight
  if (channelsToDelete.length > 0) {
    await deleteSalesChannelsWorkflow(container).run({
      input: { ids: channelsToDelete.map((c) => c.id) },
    })
    logger.info(`Saneados canales de starter: ${channelsToDelete.map((c) => c.name).join(', ')}`)
  }

  // =========================================================================
  // 2. UBICACION UNICA DE STOCK (loc_digital_warehouse)
  // =========================================================================
  const { data: initialLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name', 'sales_channels.id'],
  })

  let stockLocationId: string
  const existingLoc = initialLocations.find((loc) => loc.name === STOCK_LOCATION_NAME)
  if (existingLoc) {
    stockLocationId = existingLoc.id
  } else {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [{ name: STOCK_LOCATION_NAME }],
      },
    })
    stockLocationId = result[0].id
    logger.info(`Creada ubicacion unica de stock: ${STOCK_LOCATION_NAME} (${stockLocationId})`)
  }

  // Vincular ambos canales a la ubicacion unica
  const { data: locWithChannels } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name', 'sales_channels.id'],
    filters: { id: stockLocationId },
  })
  const currentLinkedChannels = new Set(
    (locWithChannels[0]?.sales_channels ?? [])
      .map((sc: any) => sc?.id as string)
      .filter(Boolean)
  )
  const channelsToLink = [pampaChannelId, talaChannelId].filter(
    (id) => !currentLinkedChannels.has(id)
  )
  if (channelsToLink.length > 0) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocationId,
        add: channelsToLink,
      },
    })
    logger.info(`Vinculados canales [${channelsToLink.join(', ')}] a la ubicacion ${STOCK_LOCATION_NAME}`)
  }

  // Purgar únicamente ubicaciones de starter clasificadas en pre-flight
  if (locationsToDelete.length > 0) {
    await deleteStockLocationsWorkflow(container).run({
      input: { ids: locationsToDelete.map((l) => l.id) },
    })
    logger.info(`Saneadas ubicaciones de starter: ${locationsToDelete.map((l) => l.name).join(', ')}`)
  }

  // =========================================================================
  // 3. PUBLISHABLE API KEYS (1 por marca, 0 compartidas)
  // =========================================================================
  const { data: initialApiKeys } = await query.graph({
    entity: 'api_key',
    fields: ['id', 'title', 'token', 'type', 'sales_channels.id'],
    filters: { type: 'publishable' },
  })

  let b2cKeyId = initialApiKeys.find((k) => k.title === KEY_TITLE_B2C)?.id
  if (!b2cKeyId) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            type: 'publishable',
            title: KEY_TITLE_B2C,
            created_by: adminUserId,
          },
        ],
      },
    })
    b2cKeyId = result[0].id
    logger.info(`Creada Publishable Key: ${KEY_TITLE_B2C} (${b2cKeyId})`)
  }

  let b2bKeyId = initialApiKeys.find((k) => k.title === KEY_TITLE_B2B)?.id
  if (!b2bKeyId) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            type: 'publishable',
            title: KEY_TITLE_B2B,
            created_by: adminUserId,
          },
        ],
      },
    })
    b2bKeyId = result[0].id
    logger.info(`Creada Publishable Key: ${KEY_TITLE_B2B} (${b2bKeyId})`)
  }

  // Re-consultar estado de links de API keys
  const { data: keysWithChannels } = await query.graph({
    entity: 'api_key',
    fields: ['id', 'title', 'sales_channels.id'],
    filters: { id: [b2cKeyId, b2bKeyId] },
  })
  const b2cKeyObj = keysWithChannels.find((k) => k.id === b2cKeyId)
  const b2bKeyObj = keysWithChannels.find((k) => k.id === b2bKeyId)

  // Link b2cKey exclusivamente a pampaChannelId
  const b2cLinkedChannelIds = (b2cKeyObj?.sales_channels ?? [])
    .map((sc: any) => sc?.id as string)
    .filter(Boolean)
  const b2cAdd = !b2cLinkedChannelIds.includes(pampaChannelId) ? [pampaChannelId] : undefined
  const b2cRemove = b2cLinkedChannelIds.filter((id) => id !== pampaChannelId)
  if (b2cAdd || b2cRemove.length > 0) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: b2cKeyId,
        add: b2cAdd,
        remove: b2cRemove.length > 0 ? b2cRemove : undefined,
      },
    })
  }

  // Link b2bKey exclusivamente a talaChannelId
  const b2bLinkedChannelIds = (b2bKeyObj?.sales_channels ?? [])
    .map((sc: any) => sc?.id as string)
    .filter(Boolean)
  const b2bAdd = !b2bLinkedChannelIds.includes(talaChannelId) ? [talaChannelId] : undefined
  const b2bRemove = b2bLinkedChannelIds.filter((id) => id !== talaChannelId)
  if (b2bAdd || b2bRemove.length > 0) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: b2bKeyId,
        add: b2bAdd,
        remove: b2bRemove.length > 0 ? b2bRemove : undefined,
      },
    })
  }

  // Purgar únicamente publishable keys de starter clasificadas en pre-flight
  if (keysToDelete.length > 0) {
    const keysToDeleteIds = keysToDelete.map((k) => k.id)
    await revokeApiKeysWorkflow(container).run({
      input: {
        selector: { id: keysToDeleteIds },
        revoke: { revoked_by: adminUserId },
      },
    })
    await deleteApiKeysWorkflow(container).run({
      input: { ids: keysToDeleteIds },
    })
    logger.info(`Saneadas API keys de starter: ${keysToDelete.map((k) => k.title).join(', ')}`)
  }

  // =========================================================================
  // 4. REGION Y PERFIL DE ENVIO MINIMOS (ARS / Pais: ar)
  // =========================================================================
  // Moneda ARS en Store
  const { data: storeRefreshed } = await query.graph({
    entity: 'store',
    fields: ['id', 'supported_currencies.currency_code', 'supported_currencies.is_default'],
  })
  const activeStore = storeRefreshed[0]
  const existingCurrencies = (activeStore?.supported_currencies ?? [])
    .map((c: any) => ({
      currency_code: c?.currency_code as string,
      is_default: Boolean(c?.is_default),
    }))
    .filter((c) => Boolean(c.currency_code))
  const hasArs = existingCurrencies.some((c) => c.currency_code === 'ars')

  if (!hasArs) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: activeStore.id },
        update: {
          supported_currencies: [
            { currency_code: 'ars', is_default: true },
            ...existingCurrencies
              .filter((c) => c.currency_code !== 'ars')
              .map((c) => ({
                currency_code: c.currency_code,
                is_default: false,
              })),
          ],
        },
      },
    })
    logger.info('Agregada moneda ARS como moneda por defecto del store')
  }

  // Region
  const { data: existingRegions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code', 'countries.iso_2'],
  })
  let arsRegionId = existingRegions.find((r) => r.currency_code === 'ars')?.id
  if (!arsRegionId) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: 'Argentina',
            currency_code: 'ars',
            countries: ['ar'],
          },
        ],
      },
    })
    arsRegionId = result[0].id
    logger.info(`Creada Region: Argentina (ARS) (${arsRegionId})`)
  }

  // Shipping Profile
  const { data: existingProfiles } = await query.graph({
    entity: 'shipping_profile',
    fields: ['id', 'name', 'type'],
  })
  let shippingProfileId = (
    existingProfiles.find((sp) => sp.type === 'default') ?? existingProfiles[0]
  )?.id
  if (!shippingProfileId) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: 'Perfil General de Envios',
            type: 'default',
          },
        ],
      },
    })
    shippingProfileId = result[0].id
    logger.info(`Creado Shipping Profile por defecto: ${shippingProfileId}`)
  }

  // =========================================================================
  // 5. 10 PRODUCTOS Y VARIANTES (Catalogo Maestro Unificado)
  // =========================================================================
  // Purgar únicamente productos de starter clasificados en pre-flight
  if (productsToDelete.length > 0) {
    await deleteProductsWorkflow(container).run({
      input: { ids: productsToDelete.map((p) => p.id) },
    })
    logger.info(`Saneados productos de starter: ${productsToDelete.map((p) => p.handle).join(', ')}`)
  }

  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'variants.id', 'variants.sku'],
  })
  const existingProductHandles = new Set(
    existingProducts
      .filter((p) => mercadalProductHandles.has(p.handle))
      .map((p) => p.handle)
      .filter((h): h is string => Boolean(h))
  )

  const productsToCreate: any[] = []
  for (const spec of SEED_PRODUCTS) {
    if (existingProductHandles.has(spec.handle)) {
      continue
    }

    const assignedChannelIds = spec.channels.map((ch) =>
      ch === 'b2c' ? pampaChannelId : talaChannelId
    )
    const basePrice = spec.retailPrice ?? spec.wholesalePrice ?? 10000

    productsToCreate.push({
      title: spec.title,
      handle: spec.handle,
      description: spec.description,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      sales_channels: assignedChannelIds.map((id) => ({ id })),
      options: [
        {
          title: 'Presentacion',
          values: ['Estandar'],
        },
      ],
      variants: [
        {
          title: 'Estandar',
          sku: spec.sku,
          manage_inventory: true,
          options: {
            Presentacion: 'Estandar',
          },
          prices: [
            {
              amount: basePrice,
              currency_code: 'ars',
            },
          ],
        },
      ],
    })
  }

  if (productsToCreate.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate,
      },
    })
    logger.info(`Creados ${productsToCreate.length} productos nuevos`)
  } else {
    logger.info('Todos los 10 productos de Mercadal ya existian. Omitiendo creacion.')
  }

  // =========================================================================
  // 6. INVENTARIO UNIFICADO (Inventory Items e Inventory Levels)
  // =========================================================================
  const { data: allInventoryItems } = await query.graph({
    entity: 'inventory_item',
    fields: ['id', 'sku'],
  })
  const inventoryItemBySku = new Map<string, string>()
  for (const item of allInventoryItems) {
    if (item.sku) {
      inventoryItemBySku.set(item.sku, item.id)
    }
  }

  const { data: existingLevels } = await query.graph({
    entity: 'inventory_level',
    fields: ['id', 'inventory_item_id', 'location_id', 'stocked_quantity'],
  })
  const levelByItemId = new Map<string, typeof existingLevels[0]>()
  for (const lvl of existingLevels) {
    if (lvl.location_id === stockLocationId) {
      levelByItemId.set(lvl.inventory_item_id, lvl)
    }
  }

  const levelsToCreate: any[] = []
  const levelsToUpdate: any[] = []

  for (const spec of SEED_PRODUCTS) {
    const inventoryItemId = inventoryItemBySku.get(spec.sku)
    if (!inventoryItemId) {
      logger.warn(`No se encontro inventory_item para SKU ${spec.sku}`)
      continue
    }

    const existingLevel = levelByItemId.get(inventoryItemId)
    if (!existingLevel) {
      levelsToCreate.push({
        inventory_item_id: inventoryItemId,
        location_id: stockLocationId,
        stocked_quantity: spec.targetStock,
      })
    } else if (existingLevel.stocked_quantity !== spec.targetStock) {
      levelsToUpdate.push({
        id: existingLevel.id,
        inventory_item_id: inventoryItemId,
        location_id: stockLocationId,
        stocked_quantity: spec.targetStock,
      })
    }
  }

  if (levelsToCreate.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: levelsToCreate,
      },
    })
    logger.info(`Creados ${levelsToCreate.length} niveles de inventario`)
  }

  if (levelsToUpdate.length > 0) {
    await updateInventoryLevelsWorkflow(container).run({
      input: {
        updates: levelsToUpdate,
      },
    })
    logger.info(`Actualizados ${levelsToUpdate.length} niveles de inventario`)
  }

  // =========================================================================
  // 7. PRECIOS MAYORISTAS B2B (Price List)
  // =========================================================================
  const { data: allFreshProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'variants.id', 'variants.sku'],
  })
  const variantBySku = new Map<string, string>()
  for (const prod of allFreshProducts) {
    for (const v of prod.variants ?? []) {
      if (v?.sku && v?.id) {
        variantBySku.set(v.sku, v.id)
      }
    }
  }

  const { data: priceLists } = await query.graph({
    entity: 'price_list',
    fields: ['id', 'title'],
  })
  let b2bPriceList = priceLists.find((pl) => pl.title === B2B_PRICE_LIST_TITLE)

  if (!b2bPriceList) {
    const b2bPrices: any[] = []
    for (const spec of SEED_PRODUCTS) {
      if (spec.wholesalePrice !== undefined) {
        const variantId = variantBySku.get(spec.sku)
        if (variantId) {
          b2bPrices.push({
            amount: spec.wholesalePrice,
            currency_code: 'ars',
            variant_id: variantId,
          })
        }
      }
    }

    if (b2bPrices.length > 0) {
      await createPriceListsWorkflow(container).run({
        input: {
          price_lists_data: [
            {
              title: B2B_PRICE_LIST_TITLE,
              description: 'Lista de precios mayoristas diferenciales para Talabarteria Mercadal B2B',
              status: 'active' as never,
              prices: b2bPrices,
            },
          ],
        },
      })
      logger.info(`Creada Price List '${B2B_PRICE_LIST_TITLE}' con ${b2bPrices.length} precios`)
    }
  }

  // =========================================================================
  // 8. RESUMEN VERIFICABLE DE ESTADO FINAL
  // =========================================================================
  const { data: finalChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
  })
  const { data: finalKeys } = await query.graph({
    entity: 'api_key',
    fields: ['id', 'title', 'sales_channels.id', 'sales_channels.name'],
    filters: { type: 'publishable' },
  })
  const { data: finalLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name', 'sales_channels.id', 'sales_channels.name'],
  })
  const { data: finalProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'handle', 'sales_channels.name', 'variants.sku', 'variants.id'],
  })
  const { data: finalLevels } = await query.graph({
    entity: 'inventory_level',
    fields: ['id', 'inventory_item_id', 'location_id', 'stocked_quantity'],
  })
  const { data: finalItems } = await query.graph({
    entity: 'inventory_item',
    fields: ['id', 'sku'],
  })

  // =========================================================================
  // GATE DE IDEMPOTENCIA Y VERIFICACIÓN ABSOLUTA DE CONTEOS
  // =========================================================================
  const productTotal = finalProducts.length
  const seedProductCount = finalProducts.filter(
    (p) => p.handle && mercadalProductHandles.has(p.handle)
  ).length

  if (productTotal !== 10 || seedProductCount !== 10) {
    logger.error(
      `[IDEMPOTENCY GATE FAILURE] Discrepancia en conteos absolutos de catalogo:\n` +
      `  - Total absoluto de productos en BD (productTotal): ${productTotal} (Esperado: 10)\n` +
      `  - Productos correspondientes al Seed Mercadal (seedProductCount): ${seedProductCount} (Esperado: 10)`
    )
    throw new Error(
      `[IDEMPOTENCY GATE FAILURE] Abortando por violacion de conteo: productTotal=${productTotal}, seedProductCount=${seedProductCount}. Ambos deben ser exactamente 10.`
    )
  }

  if (finalChannels.length !== 2 || finalLocations.length !== 1 || finalKeys.length !== 2) {
    logger.error(
      `[INTEGRITY GATE FAILURE] Discrepancia en configuracion comercial:\n` +
      `  - Canales: ${finalChannels.length} (Esperado: 2)\n` +
      `  - Ubicaciones: ${finalLocations.length} (Esperado: 1)\n` +
      `  - Publishable Keys: ${finalKeys.length} (Esperado: 2)`
    )
    throw new Error(
      `[INTEGRITY GATE FAILURE] Abortando por violacion de entidades base: canales=${finalChannels.length}, ubicaciones=${finalLocations.length}, keys=${finalKeys.length}`
    )
  }

  const itemToSku = new Map(finalItems.map((i) => [i.id, i.sku]))
  const skuStock = new Map<string, number>()
  for (const lvl of finalLevels) {
    if (lvl.location_id === stockLocationId) {
      const sku = itemToSku.get(lvl.inventory_item_id)
      if (sku) {
        skuStock.set(sku, lvl.stocked_quantity)
      }
    }
  }

  console.log('\n============================================================')
  console.log('       MERCADAL DIGITAL 360 — RESUMEN DE SEED STAGING       ')
  console.log('============================================================')
  console.log(`Sales Channels (${finalChannels.length} / 2 requeridos):`)
  for (const sc of finalChannels) {
    console.log(`  - [${sc.name}] (ID: ${sc.id})`)
  }

  console.log(`\nStock Locations (${finalLocations.length} / 1 requerida):`)
  for (const sl of finalLocations) {
    const linked = (sl.sales_channels ?? [])
      .map((c: any) => c?.name as string)
      .filter(Boolean)
      .join(', ')
    console.log(`  - [${sl.name}] (ID: ${sl.id}) -> Canales vinculados (${(sl.sales_channels ?? []).length}): ${linked}`)
  }

  console.log(`\nPublishable Keys (${finalKeys.length} / 2 requeridas):`)
  for (const k of finalKeys) {
    const linked = (k.sales_channels ?? [])
      .map((c: any) => c?.name as string)
      .filter(Boolean)
      .join(', ')
    console.log(`  - Key: ${k.title} (ID: ${k.id}) -> Canal: ${linked || 'NINGUNO'}`)
  }

  console.log(
    `\nCatalogo Maestro e Inventario Digital (productTotal: ${productTotal} | seedProductCount: ${seedProductCount} / 10 requeridos):`
  )
  for (const spec of SEED_PRODUCTS) {
    const measuredStock = skuStock.get(spec.sku) ?? 'SIN_NIVEL'
    console.log(
      `  - SKU: ${spec.sku.padEnd(14)} | Stock: ${String(measuredStock).padStart(3)} | Canales: [${spec.channels.join(', ')}] | Caso: ${spec.testCase}`
    )
  }

  console.log(`\nArtefactos Starter Saneados / Eliminados en esta corrida:`)
  console.log(
    `  - Canales (${channelsToDelete.length}): ${
      channelsToDelete.map((c) => `[ID:${c.id} | Nombre:${c.name}]`).join(', ') || 'ninguno'
    }`
  )
  console.log(
    `  - Ubicaciones (${locationsToDelete.length}): ${
      locationsToDelete.map((l) => `[ID:${l.id} | Nombre:${l.name}]`).join(', ') || 'ninguno'
    }`
  )
  console.log(
    `  - Claves (${keysToDelete.length}): ${
      keysToDelete.map((k) => `[ID:${k.id} | Titulo:${k.title}]`).join(', ') || 'ninguno'
    }`
  )
  console.log(
    `  - Productos (${productsToDelete.length}): ${
      productsToDelete.map((p) => `[ID:${p.id} | Handle:${p.handle} | Titulo:${p.title || 'N/A'}]`).join(', ') || 'ninguno'
    }`
  )
  console.log('============================================================\n')
}
