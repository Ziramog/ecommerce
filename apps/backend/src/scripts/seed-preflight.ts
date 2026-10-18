/**
 * Mercadal Digital 360 — Módulo Puro de Pre-flight y Clasificación de Entidades (B4/B5)
 *
 * Función pura desacoplada del contenedor y base de datos para:
 * 1. Clasificación estricta contra whitelist de artefactos conocidos del starter de Medusa.
 * 2. Detección inmediata fail-closed de cualquier entidad ajena o producto con handle nulo/inválido.
 * 3. Validación de umbrales máximos de saneamiento autorizados.
 * 4. Generación de plan detallado de saneamiento con ID + nombre/título/handle seguro (0 secretos/keys).
 */

export interface RawPreflightChannel {
  id: string
  name?: string | null
}

export interface RawPreflightLocation {
  id: string
  name?: string | null
}

export interface RawPreflightKey {
  id: string
  title?: string | null
}

export interface RawPreflightProduct {
  id: string
  title?: string | null
  handle?: string | null
}

export interface PreflightInput {
  channels: RawPreflightChannel[]
  locations: RawPreflightLocation[]
  keys: RawPreflightKey[]
  products: RawPreflightProduct[]
}

export interface SanitizationItem {
  id: string
  identifier: string
  type: 'channel' | 'location' | 'key' | 'product'
}

export interface PreflightClassificationResult {
  channelsToDelete: RawPreflightChannel[]
  locationsToDelete: RawPreflightLocation[]
  keysToDelete: RawPreflightKey[]
  productsToDelete: RawPreflightProduct[]
  unknownChannels: RawPreflightChannel[]
  unknownLocations: RawPreflightLocation[]
  unknownKeys: RawPreflightKey[]
  unknownProducts: RawPreflightProduct[]
  sanitizationPlan: SanitizationItem[]
}

// Whitelist Estricta de Artefactos Conocidos del Starter de Medusa
export const KNOWN_STARTER_CHANNELS = new Set(['Default Sales Channel'])
export const KNOWN_STARTER_LOCATIONS = new Set(['European Warehouse'])
export const KNOWN_STARTER_KEYS = new Set(['Default Publishable API Key'])
export const KNOWN_STARTER_PRODUCTS = new Set(['t-shirt', 'sweatshirt', 'sweatpants', 'shorts'])

// Umbrales Fail-Closed de Seguridad para Saneamiento
export const MAX_STARTER_CHANNELS_TO_DELETE = 1
export const MAX_STARTER_LOCATIONS_TO_DELETE = 1
export const MAX_STARTER_KEYS_TO_DELETE = 1
export const MAX_STARTER_PRODUCTS_TO_DELETE = 4

// Entidades de Dominio Autorizadas de Mercadal Digital 360
export const MERCADAL_CHANNELS = new Set(['sc_pampa_novus_b2c', 'sc_talabarteria_b2b'])
export const MERCADAL_LOCATIONS = new Set(['loc_digital_warehouse'])
export const MERCADAL_KEYS = new Set(['pk_pampa_novus_b2c', 'pk_talabarteria_b2b'])
export const MERCADAL_PRODUCT_HANDLES = new Set([
  'montura-criolla-de-trabajo',
  'bozal-cuero-crudo-trenzado',
  'cinturon-carpincho-alpaca',
  'rollo-lonja-vacuna-pack-x10',
  'estribos-chaquenos-acero-inoxidable',
  'cinchon-lona-reforzado-cuero-suela',
  'freno-criollo-cabeza-de-moro',
  'manta-sudadero-lana-pura',
  'cuchillo-criollo-vaina-repujada',
  'grasa-de-potro-cuero-500g',
])

/**
 * Clasifica y valida exhaustivamente las entidades existentes en base de datos.
 *
 * @throws {Error} Si se detecta cualquier entidad ajena/desconocida
 * @throws {Error} Si algún producto posee handle nulo, indefinido o vacío
 * @throws {Error} Si la cantidad de eliminaciones excede los umbrales máximos permitidos
 */
export function classifyAndValidatePreflight(input: PreflightInput): PreflightClassificationResult {
  // 1. Clasificación de Sales Channels
  const channelsToDelete = input.channels.filter((c) => c.name && KNOWN_STARTER_CHANNELS.has(c.name))
  const unknownChannels = input.channels.filter((c) => {
    if (!c.name || typeof c.name !== 'string' || c.name.trim() === '') return true
    return !MERCADAL_CHANNELS.has(c.name) && !KNOWN_STARTER_CHANNELS.has(c.name)
  })

  // 2. Clasificación de Stock Locations
  const locationsToDelete = input.locations.filter((l) => l.name && KNOWN_STARTER_LOCATIONS.has(l.name))
  const unknownLocations = input.locations.filter((l) => {
    if (!l.name || typeof l.name !== 'string' || l.name.trim() === '') return true
    return !MERCADAL_LOCATIONS.has(l.name) && !KNOWN_STARTER_LOCATIONS.has(l.name)
  })

  // 3. Clasificación de Publishable API Keys
  const keysToDelete = input.keys.filter((k) => k.title && KNOWN_STARTER_KEYS.has(k.title))
  const unknownKeys = input.keys.filter((k) => {
    if (!k.title || typeof k.title !== 'string' || k.title.trim() === '') return true
    return !MERCADAL_KEYS.has(k.title) && !KNOWN_STARTER_KEYS.has(k.title)
  })

  // 4. Clasificación de Productos
  // Cualquier producto con handle null/undefined/vacío debe clasificarse como unknown y abortar en preflight
  const productsToDelete = input.products.filter(
    (p) => p.handle && KNOWN_STARTER_PRODUCTS.has(p.handle)
  )
  const unknownProducts = input.products.filter((p) => {
    if (!p.handle || typeof p.handle !== 'string' || p.handle.trim() === '') {
      return true
    }
    return !MERCADAL_PRODUCT_HANDLES.has(p.handle) && !KNOWN_STARTER_PRODUCTS.has(p.handle)
  })

  // GUARDA 2: Control Fail-Closed de Entidades Desconocidas
  if (
    unknownChannels.length > 0 ||
    unknownLocations.length > 0 ||
    unknownKeys.length > 0 ||
    unknownProducts.length > 0
  ) {
    const errorMsg =
      `[FAIL-CLOSED PRE-FLIGHT] Entidades desconocidas detectadas fuera de whitelist. Abortado sin mutaciones:\n` +
      `  - Canales desconocidos (${unknownChannels.length}): ${
        unknownChannels.map((c) => c.name || `[ID:${c.id} (nombre nulo/invalido)]`).join(', ') || 'ninguno'
      }\n` +
      `  - Ubicaciones desconocidas (${unknownLocations.length}): ${
        unknownLocations.map((l) => l.name || `[ID:${l.id} (nombre nulo/invalido)]`).join(', ') || 'ninguno'
      }\n` +
      `  - API keys desconocidas (${unknownKeys.length}): ${
        unknownKeys.map((k) => k.title || `[ID:${k.id} (title nulo/invalido)]`).join(', ') || 'ninguno'
      }\n` +
      `  - Productos desconocidos (${unknownProducts.length}): ${
        unknownProducts
          .map((p) =>
            p.handle && p.handle.trim().length > 0
              ? p.handle
              : `[ID:${p.id} | Titulo:${p.title || 'N/A'} (handle nulo/invalido)]`
          )
          .join(', ') || 'ninguno'
      }`
    throw new Error(errorMsg)
  }

  // GUARDA 3: Control Fail-Closed de Umbrales Máximos
  if (
    channelsToDelete.length > MAX_STARTER_CHANNELS_TO_DELETE ||
    locationsToDelete.length > MAX_STARTER_LOCATIONS_TO_DELETE ||
    keysToDelete.length > MAX_STARTER_KEYS_TO_DELETE ||
    productsToDelete.length > MAX_STARTER_PRODUCTS_TO_DELETE
  ) {
    const thresholdMsg =
      `[FAIL-CLOSED THRESHOLD] Cantidad de eliminaciones excede los umbrales autorizados:\n` +
      `  - Canales a eliminar: ${channelsToDelete.length} (Max: ${MAX_STARTER_CHANNELS_TO_DELETE})\n` +
      `  - Ubicaciones a eliminar: ${locationsToDelete.length} (Max: ${MAX_STARTER_LOCATIONS_TO_DELETE})\n` +
      `  - Claves a eliminar: ${keysToDelete.length} (Max: ${MAX_STARTER_KEYS_TO_DELETE})\n` +
      `  - Productos a eliminar: ${productsToDelete.length} (Max: ${MAX_STARTER_PRODUCTS_TO_DELETE})`
    throw new Error(thresholdMsg)
  }

  // Construcción del plan estructurado de saneamiento con ID + nombre/título/handle seguro (0 secretos/keys)
  const sanitizationPlan: SanitizationItem[] = [
    ...channelsToDelete.map((c) => ({ id: c.id, identifier: c.name!, type: 'channel' as const })),
    ...locationsToDelete.map((l) => ({ id: l.id, identifier: l.name!, type: 'location' as const })),
    ...keysToDelete.map((k) => ({ id: k.id, identifier: k.title!, type: 'key' as const })),
    ...productsToDelete.map((p) => ({
      id: p.id,
      identifier: `${p.handle} (${p.title || 'N/A'})`,
      type: 'product' as const,
    })),
  ]

  return {
    channelsToDelete,
    locationsToDelete,
    keysToDelete,
    productsToDelete,
    unknownChannels,
    unknownLocations,
    unknownKeys,
    unknownProducts,
    sanitizationPlan,
  }
}
