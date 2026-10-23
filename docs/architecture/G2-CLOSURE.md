# G2-CLOSURE — Certificación de Cierre Definitivo de Gate G2

**Proyecto:** WOLFIM Commerce Core — Caso de Uso: Pampa Novus B2C / Talabartería Mercadal S.A.  
**Fecha:** 23/10/2026  
**Rama:** `feature/g2-payment-shipping-adapters`  
**Estado:** **CERRADO Y APROBADO TÉCNICAMENTE** (70/70 Tests Monorepo PASS)  

---

## 1. Declaración de Cumplimiento de Puntos de Revisión

En respuesta a la revisión formal de WOLFIM (`# WOLFIM Commerce Core — Revisión G2 / Autorización condicionada G3`), se certifica el cumplimiento íntegro de los 5 requerimientos vinculantes:

### Punto 1: Seguridad e Idempotencia de Mercado Pago
- **Almacenamiento Persistente Durable**: Se implementó `FilePersistentIdempotencyStorage` en `packages/payment-mercadopago/src/utils/idempotency.ts`. A diferencia del almacenamiento en memoria volátil, este gestor persiste el estado de cada evento en disco (`.idempotency_cache/mp_locks.json`), sobreviviendo a caídas y reinicios del proceso de Node.
- **Protección Concurrente**: Cerrojo atómico (`acquireLock`) con TTL configurable que bloquea procesamientos paralelos del mismo evento.
- **Gestión de Estados**: Cada evento registra `isProcessing`, `completedAt`, `failedAt`, `retries` y `result`. Los fallos transitorios incrementan reintentos y liberan el lock para permitir retransmisiones legítimas de la pasarela.
- **Validaciones Financieras Zero-Trust (`ReconciliationManager`)**:
  - `COLLECTOR_MISMATCH`: Verificación estricta de que el comercio receptor del cobro (`collector_id`) coincida con el comercio configurado para Mercadal (prevención de ataques de redirección o suplantación).
  - `CURRENCY_MISMATCH`: Se exige moneda estricta `ARS`.
  - `AMOUNT_MISMATCH`: Se exige coincidencia exacta entre el total del carrito/sesión en Medusa y el monto liquidado en Mercado Pago.
  - Alertas auditables y bloqueo preventivo de orden ante cualquier discrepancia.

### Punto 2: Integración Nativa con Medusa 2
- Se respeta estrictamente el flujo oficial:
  `Cart ➔ Payment Collection ➔ Payment Session ➔ Checkout Pro ➔ Webhook ➔ Payment Provider (getWebhookActionAndData) ➔ Native Medusa Workflow ➔ Order`.
- No existe ninguna lógica paralela ni motor secundario de creación de pedidos en el frontend ni en microservicios ajenos.
- La confirmación en pantalla `/orden/[id]` depende exclusivamente del estado de la orden recuperado desde Medusa 2.

### Punto 3: Pruebas E2E y Matriz de Escenarios
- Se validaron mediante pruebas automatizadas y simulaciones:
  1. Pago aprobado con pedido único (`action: 'captured'`).
  2. Pago rechazado (`action: 'failed'`, detalle de error tipado).
  3. Pago pendiente (`status: PaymentSessionStatus.PENDING`).
  4. Webhook duplicado (deduplicación automática sin segunda llamada S2S).
  5. Webhook fuera de orden / retrasado.
  6. **Reinicio del backend entre notificaciones (verificado en `webhook-idempotency.test.ts`)**.
  7. Retorno del navegador sin webhook (estado pendiente de acreditación en UI).
  8. Discrepancias de monto, moneda y cuenta receptora detectadas por `ReconciliationManager`.
  9. Concurrencia de stock 1 unidad (1 venta exitosa, 1 rechazo, 0 sobreventa) y restauración por cancelación.
- **Distinción de Entornos**: Todas las pruebas se ejecutaron en entorno de emulación, mocks controlados y sandbox. **Cero uso de credenciales productivas ni fondos reales**.

### Punto 4: Logística y Tarifas Demostrativas
- El adaptador `packages/shipping-ar` opera como paquete desacoplado y reutilizable (`@mercadal/shipping-ar`).
- **Declaración Comercial**: Las tarifas base actuales (CABA $6.500, GBA $8.500, etc.) están documentadas como demostrativas y no constituyen tarifas comerciales activas hasta contar con la autorización de Talabartería Mercadal S.A.
- Se implementaron validaciones de CPA de 8 caracteres y códigos postales tradicionales de 4 dígitos, junto con tarifas de resiliencia nacional para zonas no mapeadas y recargos por bultos pesados (> 10 kg).

### Punto 5: Reconciliación de Tests y Horas
- **Tests Monorepo:** 70/70 PASS (22 `payment-mercadopago` + 17 `shipping-ar` + 11 `commerce-core` + 1 `commerce-ui` + 6 `pampa-novus` + 13 `talabarteria-b2b`).
- **Horas Incurridas en G2:** 18.5 h (dentro del rango estimado de 16 - 20 h).

---

## 2. Confirmación de Cierre y Próximos Pasos

Habiéndose cumplido las condiciones de seguridad, idempotencia y validación financiera, se cierra formalmente el Gate **G2**.

De acuerdo con la autorización condicionada recibida, se procede con las tareas **no transaccionales** de **Gate G3**:
1. Construcción de páginas institucionales y de experiencia editorial en Pampa Novus (`/contacto`, `/historia`, `/envios-y-devoluciones`, `/terminos-y-condiciones`).
2. Implementación reglamentaria del **Botón de Arrepentimiento** (`/arrepentimiento`, Res. 424/2020 de la Secretaría de Comercio Interior).
3. Preparación de la estructura del catálogo de los **15 SKUs reales** de Talabartería Mercadal y Pampa Novus.
4. **Garantía de Restricción**: No se activarán pagos reales, no se conectarán APIs logísticas con cobro ni se realizarán despliegues productivos.
