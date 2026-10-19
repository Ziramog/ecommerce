# Mercadal Digital 360 — Suite de Probes de Inventario (INV-01..04)

Este directorio contiene los probes automatizados de verificación de inventario, concurrencia, idempotencia, ciclo de vida de devoluciones y consistencia de caché para el Gate F2 (**M360-012**).

## Componentes de la Suite

| Archivo | Objetivo / Gate | Requisitos de Entorno | Mutación en Staging |
|---|---|---|---|
| `probe-inv-01-concurrency.mjs` | **INV-01**: Concurrencia real sobre última unidad (`SKU-CRI-001`, stock 1). Valida que dos peticiones en paralelo den exactamente un 200 (ganador) y un 400 (rechazado por falta de stock). Incluye prueba de oversell directo (qty 2) y acumulación en dos líneas. | `BASE_URL`, `PK_B2C`, `PK_B2B`, `TOKEN_B2C`, `TOKEN_B2B` | Crea carritos de prueba; reserva 1 unidad de `SKU-CRI-001` en la orden ganadora. |
| `probe-inv-02-idempotency.mjs` | **INV-02**: Idempotencia de completado de carrito con `Idempotency-Key` duplicada. Demuestra que se crea un único pedido y una única reserva de inventario. | `BASE_URL`, `PK_B2B`, `TOKEN_B2B`, `ADMIN_TOKEN` | Crea un carrito en `SKU-DUAL-005` y reintenta el completado. |
| `probe-inv-03-lifecycle.mjs` | **INV-03**: Ciclo de vida completo: cancelación (liberación de reservas), despacho parcial (decremento físico exacto de lo despachado), devolución parcial (estado `requested` intermedio vs reingreso en `received`). | `BASE_URL`, `PK_B2C`, `TOKEN_B2C`, `ADMIN_TOKEN` | Crea órdenes de prueba en `SKU-DUAL-008`, despacha parcialmente y procesa devolución. |
| `probe-inv-04-cache.mjs` | **INV-04**: Consistencia y latencia de disponibilidad. Modifica stock por Admin API y consulta inmediatamente por Store API con `PK_B2C` y `PK_B2B`. Documenta la conclusión arquitectónica (no aplicable en monoproceso sin caché distribuida). | `BASE_URL`, `PK_B2C`, `PK_B2B`, `ADMIN_TOKEN` | Modifica temporalmente `SKU-DUAL-007` y lo restaura inmediatamente. |
| `reset-critical-stock.mjs` | **Reset**: Restaura `SKU-CRI-001` exactamente a `stocked: 1, reserved: 0, available: 1` usando Admin API oficial (sin mutaciones directas a DB). | `BASE_URL`, `ADMIN_TOKEN` | Libera reservas y reajusta nivel de inventario a 1 unidad. |
| `prepare-sec02-fixtures.mjs` | **Fixtures SEC-02**: Genera pedidos reales para cliente B2C y B2B sobre SKUs no críticos para desbloquear la prueba de seguridad cross-tenant SEC-02 (M360-011). | `BASE_URL`, `PK_B2C`, `PK_B2B`, `TOKEN_B2C`, `TOKEN_B2B`, `ADMIN_TOKEN` | Crea pedidos en `SKU-B2C-002` y `SKU-DUAL-005` y escribe `sec02-fixtures.env` (600). |
| `probe-inventory.sh` | Runner bash integral parametrizado. | Variables de entorno estándar. | Orquesta la ejecución de la suite. |

---

## Variables de Entorno Requeridas

La suite está parametrizada y **no contiene secretos en código fuente**:

```bash
export BASE_URL="http://100.124.132.48:9000"       # URL base de Medusa Staging
export PK_B2C="pk_..."                              # Publishable Key Storefront B2C (Pampa Novus)
export PK_B2B="pk_..."                              # Publishable Key Storefront B2B (Talabartería)
export TOKEN_B2C="eyJ..."                           # JWT de cliente B2C (cliente-b2c-1)
export TOKEN_B2B="eyJ..."                           # JWT de cliente B2B (mayorista-b2b-1)
export ADMIN_TOKEN="eyJ..."                         # JWT de administrador Medusa
```

En el VPS de Staging, estas variables se cargan automáticamente desde `~/mercadal-staging/staging-test-tokens.env` y el helper `~/mercadal-staging/get-admin-token.sh`.

---

## Instrucciones de Ejecución

### Ejecución Integral

```bash
# En el VPS o desde entorno con acceso a red Staging:
./tests/inventory/probe-inventory.sh
```

### Ejecución de Probes Individuales

```bash
./tests/inventory/probe-inventory.sh probe-inv-01-concurrency.mjs
./tests/inventory/probe-inventory.sh probe-inv-02-idempotency.mjs
./tests/inventory/probe-inventory.sh probe-inv-03-lifecycle.mjs
./tests/inventory/probe-inventory.sh probe-inv-04-cache.mjs
```

### Restauración de Inventario Crítico

Tras ejecutar las pruebas sobre `SKU-CRI-001`, volver a dejar Staging en estado limpio:

```bash
./tests/inventory/probe-inventory.sh reset-critical-stock.mjs
```

---

## Manejo de Estado en Staging

1. **Sin escrituras directas en PostgreSQL**: Todas las mutaciones se realizan exclusivamente a través de la API oficial de Medusa 2 (`/store` y `/admin`).
2. **Aislamiento de SKUs**:
   - `SKU-CRI-001`: Reservado estrictamente para `INV-01` (stock 1) y reseteado mediante `reset-critical-stock.mjs`.
   - `SKU-DUAL-005`, `SKU-DUAL-006`, `SKU-DUAL-007`, `SKU-DUAL-008`: Utilizados para idempotencia, despacho, devoluciones y caché.
   - `SKU-B2C-002`: Utilizado para el fixture B2C de SEC-02.
3. **Persistencia de Fixtures para SEC-02**: Los pedidos creados para probar el aislamiento cross-tenant se preservan en `$HOME/mercadal-staging/evidence/sec02-fixtures.env` (permisos 600, sin tokens) y en `$HOME/mercadal-staging/evidence/orders-inventory-m360-012.json`.
