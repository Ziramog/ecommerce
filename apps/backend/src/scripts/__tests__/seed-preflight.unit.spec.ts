import {
  classifyAndValidatePreflight,
  type PreflightInput,
} from '../seed-preflight'

describe('Seed Preflight Classifier (Pure Function)', () => {
  // Base fixtures comunes de Mercadal Digital 360
  const mercadalChannels = [
    { id: 'sc_01', name: 'sc_pampa_novus_b2c' },
    { id: 'sc_02', name: 'sc_talabarteria_b2b' },
  ]
  const mercadalLocations = [{ id: 'sloc_01', name: 'loc_digital_warehouse' }]
  const mercadalKeys = [
    { id: 'apk_01', title: 'pk_pampa_novus_b2c' },
    { id: 'apk_02', title: 'pk_talabarteria_b2b' },
  ]
  const mercadalProducts = [
    { id: 'prod_01', handle: 'montura-criolla-de-trabajo', title: 'Montura Criolla' },
    { id: 'prod_02', handle: 'bozal-cuero-crudo-trenzado', title: 'Bozal de Cuero' },
    { id: 'prod_03', handle: 'cinturon-carpincho-alpaca', title: 'Cinturon Carpincho' },
    { id: 'prod_04', handle: 'rollo-lonja-vacuna-pack-x10', title: 'Rollo de Lonja' },
    { id: 'prod_05', handle: 'estribos-chaquenos-acero-inoxidable', title: 'Estribos Chaquenos' },
    { id: 'prod_06', handle: 'cinchon-lona-reforzado-cuero-suela', title: 'Cinchon Lona' },
    { id: 'prod_07', handle: 'freno-criollo-cabeza-de-moro', title: 'Freno Criollo' },
    { id: 'prod_08', handle: 'manta-sudadero-lana-pura', title: 'Manta Sudadero' },
    { id: 'prod_09', handle: 'cuchillo-criollo-vaina-repujada', title: 'Cuchillo Criollo' },
    { id: 'prod_10', handle: 'grasa-de-potro-cuero-500g', title: 'Grasa de Potro' },
  ]

  // =========================================================================
  // (a) STARTER EXACTO PERMITIDO -> PLAN DE 1/1/1/4
  // =========================================================================
  test('(a) Starter exacto permitido genera un plan de saneamiento de 1 canal, 1 ubicacion, 1 key y 4 productos', () => {
    const input: PreflightInput = {
      channels: [
        ...mercadalChannels,
        { id: 'sc_starter_01', name: 'Default Sales Channel' },
      ],
      locations: [
        ...mercadalLocations,
        { id: 'sloc_starter_01', name: 'European Warehouse' },
      ],
      keys: [
        ...mercadalKeys,
        { id: 'apk_starter_01', title: 'Default Publishable API Key' },
      ],
      products: [
        ...mercadalProducts,
        { id: 'prod_starter_01', handle: 't-shirt', title: 'Medusa T-Shirt' },
        { id: 'prod_starter_02', handle: 'sweatshirt', title: 'Medusa Sweatshirt' },
        { id: 'prod_starter_03', handle: 'sweatpants', title: 'Medusa Sweatpants' },
        { id: 'prod_starter_04', handle: 'shorts', title: 'Medusa Shorts' },
      ],
    }

    const result = classifyAndValidatePreflight(input)

    expect(result.channelsToDelete).toHaveLength(1)
    expect(result.channelsToDelete[0].name).toBe('Default Sales Channel')

    expect(result.locationsToDelete).toHaveLength(1)
    expect(result.locationsToDelete[0].name).toBe('European Warehouse')

    expect(result.keysToDelete).toHaveLength(1)
    expect(result.keysToDelete[0].title).toBe('Default Publishable API Key')

    expect(result.productsToDelete).toHaveLength(4)
    expect(result.productsToDelete.map((p) => p.handle)).toEqual([
      't-shirt',
      'sweatshirt',
      'sweatpants',
      'shorts',
    ])

    expect(result.sanitizationPlan).toHaveLength(7)
    // Verificar que cada item contiene ID y nombre/handle seguro sin secretos
    for (const item of result.sanitizationPlan) {
      expect(item.id).toBeDefined()
      expect(item.identifier).toBeDefined()
      expect(item.type).toMatch(/channel|location|key|product/)
    }
  })

  // =========================================================================
  // (b) ENTIDAD DESCONOCIDA -> THROW ANTES DE MUTACIÓN
  // =========================================================================
  test('(b) Entidad desconocida fuera de whitelist arroja excepción antes de cualquier mutación', () => {
    const inputWithUnknownChannel: PreflightInput = {
      channels: [
        ...mercadalChannels,
        { id: 'sc_rogue_99', name: 'sc_unauthorized_storefront' },
      ],
      locations: mercadalLocations,
      keys: mercadalKeys,
      products: mercadalProducts,
    }

    expect(() => classifyAndValidatePreflight(inputWithUnknownChannel)).toThrow(
      /\[FAIL-CLOSED PRE-FLIGHT\].*sc_unauthorized_storefront/s
    )

    const inputWithUnknownProduct: PreflightInput = {
      channels: mercadalChannels,
      locations: mercadalLocations,
      keys: mercadalKeys,
      products: [
        ...mercadalProducts,
        { id: 'prod_unknown_88', handle: 'vestido-noche-seda', title: 'Vestido de Noche' },
      ],
    }

    expect(() => classifyAndValidatePreflight(inputWithUnknownProduct)).toThrow(
      /\[FAIL-CLOSED PRE-FLIGHT\].*vestido-noche-seda/s
    )
  })

  // =========================================================================
  // (c) PRODUCTO CON HANDLE NULL/VACÍO -> THROW SEGURO POR ID/TÍTULO
  // =========================================================================
  test('(c) Producto con handle nulo o vacío debe clasificarse como unknown y abortar preflight', () => {
    const inputWithNullHandle: PreflightInput = {
      channels: mercadalChannels,
      locations: mercadalLocations,
      keys: mercadalKeys,
      products: [
        ...mercadalProducts,
        { id: 'prod_null_01', handle: null, title: 'Producto Huerfano Sin Handle' },
      ],
    }

    expect(() => classifyAndValidatePreflight(inputWithNullHandle)).toThrow(
      /\[FAIL-CLOSED PRE-FLIGHT\].*prod_null_01.*Producto Huerfano Sin Handle.*handle nulo\/invalido/s
    )

    const inputWithEmptyHandle: PreflightInput = {
      channels: mercadalChannels,
      locations: mercadalLocations,
      keys: mercadalKeys,
      products: [
        ...mercadalProducts,
        { id: 'prod_empty_02', handle: '   ', title: 'Producto Handle Espacios' },
      ],
    }

    expect(() => classifyAndValidatePreflight(inputWithEmptyHandle)).toThrow(
      /\[FAIL-CLOSED PRE-FLIGHT\].*prod_empty_02.*Producto Handle Espacios.*handle nulo\/invalido/s
    )
  })

  // =========================================================================
  // (d) EXCESO DE UMBRAL -> THROW ANTES DE MUTACIÓN
  // =========================================================================
  test('(d) Exceso de umbral de saneamiento permitido arroja excepcion fail-closed', () => {
    const inputExceedingChannels: PreflightInput = {
      channels: [
        ...mercadalChannels,
        { id: 'sc_starter_01', name: 'Default Sales Channel' },
        { id: 'sc_starter_02', name: 'Default Sales Channel' }, // 2 canales excede MAX (1)
      ],
      locations: mercadalLocations,
      keys: mercadalKeys,
      products: mercadalProducts,
    }

    expect(() => classifyAndValidatePreflight(inputExceedingChannels)).toThrow(
      /\[FAIL-CLOSED THRESHOLD\].*Canales a eliminar: 2 \(Max: 1\)/s
    )

    const inputExceedingProducts: PreflightInput = {
      channels: mercadalChannels,
      locations: mercadalLocations,
      keys: mercadalKeys,
      products: [
        ...mercadalProducts,
        { id: 'p1', handle: 't-shirt' },
        { id: 'p2', handle: 'sweatshirt' },
        { id: 'p3', handle: 'sweatpants' },
        { id: 'p4', handle: 'shorts' },
        { id: 'p5', handle: 't-shirt' }, // 5 productos excede MAX (4)
      ],
    }

    expect(() => classifyAndValidatePreflight(inputExceedingProducts)).toThrow(
      /\[FAIL-CLOSED THRESHOLD\].*Productos a eliminar: 5 \(Max: 4\)/s
    )
  })

  // =========================================================================
  // (e) ESTADO LIMPIO IDEMPOTENTE MERCADAL
  // =========================================================================
  test('(e) Estado ya saneado con solo entidades de Mercadal no genera eliminaciones y valida limpio', () => {
    const cleanInput: PreflightInput = {
      channels: mercadalChannels,
      locations: mercadalLocations,
      keys: mercadalKeys,
      products: mercadalProducts,
    }

    const result = classifyAndValidatePreflight(cleanInput)
    expect(result.channelsToDelete).toHaveLength(0)
    expect(result.locationsToDelete).toHaveLength(0)
    expect(result.keysToDelete).toHaveLength(0)
    expect(result.productsToDelete).toHaveLength(0)
    expect(result.sanitizationPlan).toHaveLength(0)
  })
})
