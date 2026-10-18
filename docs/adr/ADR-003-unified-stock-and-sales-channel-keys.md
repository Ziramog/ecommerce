# ADR-003: Ubicación Única de Stock, Canales Comerciales y Publishable Keys Scoped

## Estado
Aceptado

## Contexto
Mercadal Digital 360 implementa una arquitectura de comercio electrónico unificado que atiende simultáneamente dos modelos de negocio y storefronts independientes:
1. **Pampa Novus (B2C)**: Tienda minorista abierta (`sc_pampa_novus_b2c`).
2. **Talabartería Mercadal (B2B)**: Portal mayorista privado para clientes comerciales aprobados (`sc_talabarteria_b2b`).

Ambas marcas comparten un catálogo maestro de productos unificado por SKU y un único inventario digital común. La coexistencia de dos canales sobre una misma infraestructura requiere definiciones arquitectónicas precisas respecto a:
- La representación y asignación del inventario digital físico para evitar sobreventa o fragmentación artificial del stock.
- La función y alcance de las Publishable API Keys en relación con la seguridad y la partición de datos.
- La neutralización de datos sintéticos de prueba del starter que contaminen las mediciones de la Prueba de Concepto (PoC).

---

## Decisiones

### 1. Ubicación Lógica Única de Stock (`loc_digital_warehouse`)
Se adopta una **única ubicación lógica de stock** (`loc_digital_warehouse`), vinculada bidireccionalmente a ambos canales de venta (`sc_pampa_novus_b2c` y `sc_talabarteria_b2b`) mediante el workflow `linkSalesChannelsToStockLocationWorkflow`.
- **Razón técnica**: Si se definieran almacenes virtuales independientes por marca, el inventario quedaría fragmentado y requeriría procesos de transferencia o sincronización interna propensos a condiciones de carrera. Una ubicación única compartida garantiza que cualquier orden confirmada en B2C o B2B descuente del mismo nivel de inventario (`inventory_level`), previniendo físicamente la sobreventa.
- **Limpieza de defaults**: Se elimina cualquier ubicación predeterminada del starter (ej. `European Warehouse`) para asegurar un estado determinístico con `stock_locations` count = 1.

### 2. Publishable API Keys Scoped por Canal (0 Keys Compartidas)
Se crean exactamente dos Publishable API Keys:
- `pk_pampa_novus_b2c` asociada unívocamente a `sc_pampa_novus_b2c`.
- `pk_talabarteria_b2b` asociada unívocamente a `sc_talabarteria_b2b`.
- **Cero claves compartidas**: Ninguna clave posee acceso a más de un canal.

#### Principio Fundamental de Seguridad:
> [!IMPORTANT]
> **La Publishable API Key NO es un mecanismo de autenticación ni de autorización.**
> Su propósito técnico en Medusa 2 es exclusivamente delimitar el alcance (scope) de las consultas de catálogo en la Store API pública (`x-publishable-api-key`). No otorga privilegios administrativos ni valida la identidad del comprador.
> La protección del canal mayorista B2B (precios especiales, cotizaciones RFQ, visualización de condiciones comerciales) se delega estrictamente en la autenticación de usuarios de cliente (`customer`), asignación a grupos comerciales aprobados (`customer_group`) y reglas de listas de precios (`price_list`), nunca en el secreto de la key.

### 3. Neutralización del Seed de Demo del Starter
El script provisto por el starter oficial (`apps/backend/src/scripts/seed-demo-products.ts`) crea 50 productos de indumentaria sintéticos con generación pseudoaleatoria de variantes y facetas.
- **Decisión**: Se neutraliza completamente retirándolo de la ruta de ejecución del backend (`apps/backend/src/scripts/`) y archivándolo como referencia histórica en `docs/historical/seed-demo-products.ts.txt`.
- **Justificación**: Cincuenta productos de demo contaminan las métricas de inventario, falsean las pruebas de concurrencia y contradicen la especificación de la PoC (10 SKU de dominio real con inventario digital conocido y trazable).
- En su lugar, se implementa un script único, reproducible e idempotente (`apps/backend/src/scripts/seed-staging.ts`).

### 4. Guardas de Seguridad Fail-Closed y Saneamiento Restringido a Whitelist
Dado que el entorno de staging de Medusa corre con `NODE_ENV=production` para emular fidelidad operativa, cualquier script de seed con capacidad de mutación o saneamiento destructivo introduce riesgos de seguridad y estabilidad si se invoca erróneamente en contextos inadecuados o con datos no previstos.

- **Doble Bandera de Confirmación Obligatoria**:
  El script aborta inmediatamente con excepción antes de resolver cualquier workflow o mutar la base si no se proporcionan deliberadamente ambas variables de entorno:
  `MERCADAL_SEED_ENV=staging` y `ALLOW_DESTRUCTIVE_SEED=true`.
- **Pre-flight Audit y Whitelist Estricta de Artefactos de Starter**:
  Queda prohibido el uso de filtros genéricos de exclusión (`name !== ...` o `handle !== ...`). El saneamiento sólo puede operar sobre una whitelist estricta y explícita de artefactos conocidos del starter oficial de Medusa:
  - Canales: `Default Sales Channel`
  - Ubicaciones: `European Warehouse`
  - Claves: `Default Publishable API Key`
  - Productos: `t-shirt`, `sweatshirt`, `sweatpants`, `shorts`
- **Fallo Seguro ante Entidades Desconocidas y Handles Nulos/Vacíos**:
  Si la base contiene entidades que no pertenecen ni a la whitelist del starter ni al catálogo/configuración oficial de Mercadal, el script aborta inmediatamente en la fase pre-flight sin ejecutar mutaciones de ningún tipo.
  Asimismo, cualquier producto con `handle` nulo, indefinido o vacío es clasificado explícitamente como desconocido (`unknown`), reportando de forma segura su identificador (`ID: <id> | Titulo: <titulo>`) sin exponer datos sensibles, impidiendo que quede invisible ante filtros condicionales.
- **Gate de Idempotencia y Conteos Absolutos**:
  Al finalizar la ejecución, el script mide el conteo absoluto de productos en base de datos (`productTotal`) sin filtros de ningún tipo, contrastándolo con el conteo de productos del catálogo Mercadal (`seedProductCount`). Si `productTotal !== 10` o `seedProductCount !== 10`, el script aborta con error fail-closed (`[IDEMPOTENCY GATE FAILURE]`), garantizando que no existan productos residuales o duplicados.
- **Desacoplamiento en Función Pura Testeable (`classifyAndValidatePreflight`)**:
  Para permitir la verificación rigurosa de las ramas de bootstrap y saneamiento sin requerir mutaciones sintéticas en la base viva de staging, la lógica de pre-flight audit se desacopló en una función pura testeable con fixtures sintéticos que cubren exhaustivamente:
  - (a) Starter exacto permitido -> plan de 1/1/1/4.
  - (b) Entidad desconocida fuera de whitelist -> throw antes de mutación.
  - (c) Producto con handle nulo o vacío -> throw seguro por ID/título.
  - (d) Exceso de umbrales máximos autorizados -> throw.
  - (e) Estado limpio idempotente de Mercadal -> 0 eliminaciones.
- **Trazabilidad de Saneamiento sin Secretos**:
  Tanto el plan previo como el resumen final enumeran de forma determinística cada artefacto a purgar mediante su ID y nombre/título/handle seguro (`[ID: ... | Nombre: ...]`), garantizando que los valores de publishable keys o datos sensibles nunca sean registrados en logs ni consola.
- **Umbrales Máximos de Seguridad**:
  Se definen topes máximos por entidad (`MAX_STARTER_*_TO_DELETE`) para impedir borrados masivos imprevistos ante eventuales inconsistencias de catálogo.

---

## Consecuencias
- **Consistencia de Inventario**: Ambas marcas consultan y reservan sobre un stock común verificable en tiempo real.
- **Aislamiento Comercial**: Los storefronts B2C y B2B consultan sus respectivos catálogos de forma aislada a través de su Publishable Key, manteniendo la partición visual y de precios.
- **Idempotencia y Pureza Garantizada**: El seed puede ejecutarse reiteradas veces en staging sin duplicar productos, canales, ubicaciones ni claves; el gate absoluto de catálogo aborta ante cualquier desvío de `productTotal !== 10`.
- **Protección Fail-Closed y Verificabilidad Offline**: Imposibilidad de ejecutar el seed accidentalmente o borrar entidades ajenas a la whitelist del starter, con cobertura de pruebas unitarias 100% aisladas para bootstrap y saneamiento.
- **Preparación para Pruebas**: Queda disponible el SKU `SKU-CRI-001` con existencia exacta = 1 para la ejecución de pruebas de concurrencia y sobreventa (INV-01).

