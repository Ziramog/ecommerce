# WOLFIM Commerce Core — Matriz de Certificación y Separación de Pruebas

Este directorio contiene las especificaciones y guiones de certificación para el entorno de Staging y Preproducción, estructurados según los tres niveles de aislamiento exigidos por WOLFIM:

```
tests/
├── e2e-staging/              # CAPA C: Pruebas de Integración y E2E en Staging
│   ├── README.md             # Esta documentación y taxonomía
│   └── staging-e2e-suite.ts  # Suite integral ejecutable (Medusa + Sandbox + DB)
├── inventory/                # Pruebas de stock y concurrencia específicas
├── price/                    # Pruebas de discriminación de precios B2B/B2C
└── security/                 # Pruebas de credenciales, sales channels y firmas
```

---

## Taxonomía de Pruebas

| Capa | Tipo | Alcance | Dependencias | Entorno |
|---|---|---|---|---|
| **Capa A** | **Unitarias Simuladas** | Lógica de negocio pura, cálculo de fletes, helpers monetarios, HMAC crypto, validadores CUIT/CPA. | Mocks en memoria (`MemoryIdempotencyStorage`, fixtures estáticos). | Local / CI (offline) |
| **Capa B** | **Transaccionales con Base de Datos** | Idempotencia transaccional, bloqueos atómicos `INSERT ... ON CONFLICT`, recuperación de bloqueos colgados (`stale lock recovery`), restricciones `PRIMARY KEY`. | Motor PostgreSQL (o `MockTransactionalPostgresQueryRunner` que valida sintaxis SQL y restricciones). | Local / Staging DB |
| **Capa C** | **Integración E2E en Staging** | Ciclo de compra completo: Cart ➔ Checkout ➔ MP Preference ➔ Webhook S2S ➔ Medusa Native Workflow ➔ Order ➔ Inventory Deduction ➔ Concurrencia B2B/B2C. | Backend Medusa 2.21.2 activo en VPS Staging (`100.124.132.48:9000`), PostgreSQL Staging, Redis Staging, Mercado Pago Sandbox. | Staging VPS (vía Tailscale) |

---

## Escenarios Cubiertos en Capa C (E2E Staging)

1. **E2E-01 — Carrito y Checkout B2C:** Creación de sesión de carrito, adición de líneas de producto, fijación de dirección en CABA/GBA y cálculo autoritativo de flete en servidor.
2. **E2E-02 — Mercado Pago Sandbox:** Generación de preferencia de Checkout Pro con `collector_id`, `init_point`, `notification_url` y referencia transaccional encriptada.
3. **E2E-03 — Webhook y Workflow Nativo Medusa:** Emisión de webhook simulado con firma HMAC-SHA256 válida (`ts`, `v1`), consulta S2S autoritativa a MP y ejecución del workflow nativo de creación de orden.
4. **E2E-04 — Generación Única de Pedidos:** Doble emisión del mismo webhook con clave de idempotencia activa; verificación de que se genera exactamente 1 orden en Medusa y se deduplica la segunda notificación.
5. **E2E-05 — Deducción de Inventario Unificado:** Verificación de que el nivel de inventario en `loc_digital_warehouse` disminuye en la cantidad exacta comprada.
6. **E2E-06 — Concurrencia B2B/B2C (INV-01):** Compra simultánea de B2C y pedido mayorista B2B por la última unidad de `SKU-CRI-001` (stock = 1); exactamente 1 triunfa y 1 es rechazada por falta de existencia (0 sobreventa).
7. **E2E-07 — Recuperación de Errores y Conciliación:** Cobro capturado en Mercado Pago con interrupción de red en Medusa; detección y registro automático en `ReconciliationManager` como incidente `ORPHAN_CAPTURED_PAYMENT`.
