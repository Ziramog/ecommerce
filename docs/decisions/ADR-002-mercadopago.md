# ADR-002: Arquitectura del Adaptador de Mercado Pago y Seguridad Transaccional

## Estado
Aprobado (Fase G2 — WOLFIM Commerce Core)

## Contexto y Motivación
La plataforma Mercadal Digital 360 requiere un medio de cobro oficial y accesible para el mercado minorista argentino (Pampa Novus B2C). En Argentina, Mercado Pago es la pasarela dominante tanto por cobertura de medios de pago locales (tarjetas de crédito en cuotas, débito, dinero en cuenta Mercado Pago) como por confianza del consumidor.

En Medusa 2.21.2, el subsistema de pagos opera bajo el `Payment Module` y la abstracción `AbstractPaymentProvider`. A diferencia de versiones legadas de Medusa 1.x, Medusa 2 exige que los proveedores de pago manejen colecciones de pago (`PaymentCollection`), sesiones (`PaymentSession`) y webhooks desacoplados con contratos asíncronos rigurosos.

Al auditar las opciones existentes de la comunidad, se determinó que la mayoría de los paquetes públicos:
1. Pertenecen al ecosistema Medusa 1.x (obsoletos e incompatibles con el runtime de Medusa 2).
2. Asumen flujos simples basados en redirect (`back_url`) sin verificación server-to-server del estado del pago.
3. Carecen de validación criptográfica de firma `x-signature` y de deduplicación idempotente frente a reintentos masivos de webhooks.

Por lo tanto, se define el desarrollo de un módulo desacoplado propio dentro del monorepo: `packages/payment-mercadopago`.

---

## Decisiones de Diseño

### 1. Modelo de Integración: Checkout Pro
Se prioriza **Checkout Pro** (vía Mercado Pago Preferences API / Orders API).
- **Justificación**: Proporciona cumplimiento PCI-DSS sin intermediación de datos de tarjetas en el storefront ni en el backend, habilita la experiencia nativa de pago rápido de Mercado Pago y soporta promociones bancarias vigentes.
- **Flujo de Inicio**: El storefront solicita la inicialización de la sesión de pago al backend Medusa. El provider crea la preferencia en Mercado Pago con los ítems, montos e impuestos computados exclusivamente en el servidor y retorna el `init_point` / `sandbox_init_point` junto con el correlation ID (`preference_id`).

### 2. Aislamiento Multi-Implementación por Entorno y Cliente
- Ninguna credencial (`access_token`, `public_key`, `webhook_secret`) reside en el código fuente.
- Las credenciales se inyectan como opciones tipadas del provider en `medusa-config.ts` o variables de entorno seguras de backend (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `MERCADOPAGO_SANDBOX`).
- Cada comercio o futuro cliente de WOLFIM opera con su propio par de claves y su propia cuenta comercial de Mercado Pago.

### 3. Verificación Criptográfica Obligatoria de Webhooks (`x-signature`)
- Mercado Pago envía las cabeceras `x-signature` y `x-request-id` en cada notificación de webhook.
- La cabecera `x-signature` contiene:
  - `ts`: timestamp en formato epoch milisegundos.
  - `v1`: hash HMAC-SHA256 computado sobre la plantilla del evento: `id:[data.id];request-id:[x-request-id];ts:[ts];`.
- El webhook receptor valida criptográficamente que la firma coincida usando el `webhook_secret` configurado y rechaza solicitudes cuyo timestamp tenga un desfase mayor a 5 minutos (mitigación de ataques de repetición / replay attacks).

### 4. Consulta Server-to-Server (Zero-Trust en Payloads)
- El endpoint de webhook **nunca confía** en los datos de estado recibidos en el cuerpo del webhook ni en los parámetros de retorno en la querystring del navegador (`collection_status=approved`).
- Al recibir una notificación válida, el backend ejecuta inmediatamente una consulta autenticada server-to-server a la API oficial de Mercado Pago:
  `GET https://api.mercadopago.com/v1/payments/{payment_id}`
- Únicamente si la API oficial responde con estado `approved`, monto igual al total de la orden y moneda `ARS`, se emite la acción `PaymentActions.SUCCESSFUL` (`captured`).

### 5. Idempotencia y Deduplicación Transaccional
- Mercado Pago reintenta el envío de webhooks ante demoras superiores a 3 segundos.
- Se implementa un registro de deduplicación por clave de idempotencia compuesta:
  `idempotency_key = mp_evt:${action}:${payment_id}:${status}`
- Si un evento ya fue procesado o se encuentra en proceso, se responde con HTTP `200 OK` inmediatamente evitando la duplicación de pedidos o transacciones concurrentes.

### 6. Desacoplamiento de la URL de Retorno (`back_url`)
- La página `/orden/[id]` a la que redirige `back_url` solo sirve como acuse de recibo preliminar para el usuario.
- La orden permanece en estado `pending` hasta que el webhook autenticado y verificado server-to-server la marque como completada.
- Si el usuario cierra el navegador o pierde conexión durante el redirect, el webhook garantiza la acreditación y notificación asíncrona sin pérdida de pedidos.

---

## Consecuencias y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| Timeout en consulta S2S a Mercado Pago | Reintento con backoff exponencial e idempotencia; el webhook reintentado resolverá el estado. |
| Intento de spoofing de notificaciones | Rechazo inmediato de solicitudes sin cabecera `x-signature` válida o con firma discordante. |
| Notificación de pago fuera de orden (ej: reembolso antes de captura) | Validación de máquina de estados de Medusa 2 (`PaymentSessionStatus`). |
| Pago acreditado pero fallo al completar orden | Registro en cola de conciliación para alerta y auditoría sin pérdida de dinero ni entrega huérfana. |
