# ADR-004: Aislamiento de Precios por Customer Group, Catálogo por Canal y Política de Identidades

## Estado
Aceptado (con diferimiento formal de SEC-03 aprobado por Juan el 2026-10-18)

---

## Contexto

Durante la validación de la imagen base de Staging (`2.21.2-88e7a30`) en el ticket M360-010, se midió un baseline en rojo reproducible: al consultar el producto `SKU-CRI-001` (`montura-criolla-de-trabajo`) de forma anónima a través de la Store API con la Publishable API Key del canal B2C (`sc_pampa_novus_b2c`), el motor de precios retornó el importe mayorista de `$320.000 ARS` (`price_list_type: sale`) en lugar del importe minorista base de `$450.000 ARS`.

El análisis de base de datos reveló que:
1. La lista mayorista `Lista Mayorista Talabarteria B2B` se había creado sin ningún tipo de scope o regla: `price_list_rule` contenía 0 filas.
2. No existían grupos de clientes creados (`customer_group` = 0 filas).
3. Sin restricciones de grupo o reglas asociadas, el motor de Medusa 2 aplica las listas de precios activas globalmente a cualquier visitante.

Para resolver de manera definitiva y reproducible la separación de precios y accesos en el backend (no en la UI), se requirió auditar las interfaces del paquete instalado de Medusa 2.21.2 y diseñar la política de precios, catálogo e identidades.

---

## Decisiones

### 1. El Precio se Aísla Estrictamente por Customer Group (`customer.groups.id`)
Se analizó la definición de tipos en `@medusajs/types/dist/pricing/common/pricing-context.d.ts`:
```ts
export interface MedusaPricingContext {
  region_id?: string;
  currency_code?: string;
  customer_id?: string;
  customer?: {
    groups?: { id: string }[];
  };
}
```

**Hallazgo Crítico**:
`sales_channel_id` **no forma parte de `MedusaPricingContext`** en Medusa 2.21.2. Por lo tanto, intentar definir una regla de precios basada en canal de venta (`sales_channel_id`) es técnicamente inerte y nunca matchea en la evaluación de precios en tiempo de ejecución.

**Decisión**:
- El aislamiento de precios se implementa **exclusivamente mediante Customer Groups** utilizando el atributo de regla `'customer.groups.id'`.
- Se crean exactamente dos grupos de clientes en el sistema:
  - `cg_pampa_novus_b2c`: Grupo para clientes minoristas de Pampa Novus.
  - `cg_talabarteria_b2b`: Grupo para clientes mayoristas comerciales aprobados de Talabartería Mercadal.
- La lista `Lista Mayorista Talabarteria B2B` queda acotada mediante una regla de lista de precios (`price_list_rule`) con atributo `customer.groups.id` y valor `[cg_talabarteria_b2b.id]`.
- Visitantes anónimos y clientes del canal minorista B2C (que no pertenecen al grupo B2B) reciben única y soberanamente los precios base por variante (`retailPrice`), sin aplicar descuentos ni listas mayoristas.

### 2. El Sales Channel Aísla Únicamente Catálogo de Productos
Dado que `sales_channel_id` no participa en el contexto de precios:
- La Publishable API Key vinculada a cada canal (`pk_pampa_novus_b2c` y `pk_talabarteria_b2b`) delimita **únicamente la visibilidad de catálogo** (productos y variantes publicados en cada canal).
- La exclusión de productos B2B del canal B2C (ej. `SKU-B2B-004` `rollo-lonja-vacuna-pack-x10`) y de productos B2C del canal B2B (ej. `SKU-B2C-003` `cinturon-carpincho-alpaca`) se gestiona a través de la asignación de canales comerciales (`product_sales_channel`), no por reglas de precio.

### 3. Persistencia de Reglas y Mutación Vía Workflows Oficiales
En el esquema de Medusa 2.21.2, la tabla `price_list_rule` almacena directamente el atributo y su valor asociado en formato JSON (`attribute: text`, `value: json`, e.g. `customer.groups.id` con `["cusgroup_..."]`).
- **Decisión**: Queda estrictamente prohibido insertar o mutar reglas de precios y grupos mediante sentencias `INSERT` directas en PostgreSQL.
- Toda mutación se ejecuta a través de los workflows oficiales del framework (`createCustomerGroupsWorkflow` y `updatePriceListsWorkflow`) o endpoints autenticados de la Admin API para garantizar la correcta validación, tipado y serialización DML.
- Toda regla debe ser verificada leyendo de vuelta la representación persistida y contrastada con probes end-to-end (rojo → verde).

### 4. Diferimiento Formal de SEC-03 (Mismo Email en Dos Marcas)
- **Comportamiento Nativo de Medusa 2**: La entidad de autenticación (`auth_identity`) en el proveedor `emailpass` es única por la tupla `(email, provider)`. Intentar registrar el mismo email en ambos storefronts no crea cuentas independientes con historiales aislados, sino que reutiliza la identidad global y retorna el mismo token JWT.
- **Decisión Aprobada por Juan (2026-10-18)**:
  - Para la fase actual de Staging / PoC, **se utilizan emails distintos por marca** (`cliente-b2c-*@mercadal-staging.internal` y `mayorista-b2b-*@mercadal-staging.internal`).
  - La funcionalidad de permitir un mismo email con cuentas e historiales particionados por marca se difiere a una fase posterior mediante desarrollo de un proveedor de autenticación modular o custom context por canal.
  - **SEC-03 se registra formalmente como NO EJECUTADO**, nunca como PASS ni falsamente omitido.

### 5. Trazabilidad Fail-Closed en Dockerfile (`GIT_SHA`)
Para garantizar trazabilidad absoluta de la imagen de staging:
- El `Dockerfile` incorpora en las etapas `builder` y `runtime` la validación estricta:
  `RUN [ "$GIT_SHA" != "unknown" ] || { echo "GIT_SHA requerido"; exit 1; }`.
- Si `docker build` se invoca sin `--build-arg GIT_SHA=<hash>`, la compilación aborta de forma fail-closed con código de salida 1.
- La imagen resultante contiene el label OCI `org.opencontainers.image.revision` coincidente exactamente con el `git rev-parse HEAD` del repositorio.

---

## Consecuencias

### Positivas
- **Aislamiento de Precios Robusto**: Los precios mayoristas quedan protegidos en la base de datos y en el motor de precios; ninguna petición anónima ni cliente B2C puede ver ni aplicar precios mayoristas.
- **Defensa en Profundidad**: Manipulación de payloads en `/store/carts/:id/line-items` (inyección de `unit_price` o `amount`) es rechazada con HTTP 400 por validación estricta de Zod; el servidor recalcula el precio soberanamente.
- **Claridad Arquitectónica**: Queda documentado que en Medusa 2.21.2 los canales aíslan catálogo y los customer groups aíslan precios, evitando intentos fallidos de configurar reglas inexistentes de `sales_channel_id` en precios.
- **Trazabilidad Verificable**: Toda imagen desplegada en Staging cuenta con SHA verificable e inmutable.

### Compensaciones y Limitaciones (Trade-offs)
- **Identidad de Cuentas Diferida (SEC-03)**: Clientes que operen como minoristas y mayoristas simultáneamente deben emplear direcciones de correo electrónico distintas hasta la implementación del módulo de autenticación multi-marca.
