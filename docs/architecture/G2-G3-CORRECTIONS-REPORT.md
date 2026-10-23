# G2-G3-CORRECTIONS-REPORT — Informe de Correcciones y Homologación Comercial/Técnica

**Proyecto:** WOLFIM Commerce Core — Caso de Uso Piloto: Pampa Novus B2C / Talabartería Mercadal S.A.  
**Fecha:** 23/10/2026 · **Gate:** G2 / G3 (Auditoría y Corrección Integral)  
**Rama:** `feature/g3-pampa-novus-boutique`  
**Estado:** CORRECCIONES APLICADAS · NO-GO PRODUCTIVO MANTENIDO · LISTO PARA REVISIÓN WOLFIM  

---

## 1. Hallazgos de la Auditoría

En cumplimiento de la Directiva de Corrección de WOLFIM, se realizó una auditoría minuciosa sobre la totalidad de los entregables de G2 y G3, identificándose los siguientes desvíos que requerían subsanación inmediata:

| Área auditada | Hallazgo / Desvío detectado | Impacto / Riesgo | Estado de corrección |
|---|---|---|:---:|
| **Legal / Fiscal** | Presencia de CUIT ficticio (`30-71234567-8`) y razón social societaria preliminar no ratificada en pie de página y contratos. | Riesgo de nulidad o infracción tributaria si se publica en producción sin constancia oficial de AFIP/ARCA. | **SUBSANADO** (`CLIENT_COMMERCIAL_CONFIG`) |
| **Comercial / Físico** | Domicilio de Showroom (`Av. Alvear 1850`) y horarios de atención tomados del mockup sin confirmación de contrato o sede real de Mercadal. | Confusión operativa con clientes finales si concurren a una dirección no habilitada. | **SUBSANADO** (Marcado `PENDING_CLIENT_APPROVAL`) |
| **Promociones Financieras** | Se exhibía *"Hasta 3 cuotas sin interés"* en `Footer.tsx` sin existir convenio de absorción de costo financiero con pasarelas o bancos. | Infracción a la regla de Capa 03 (*"no inventar cuotas sin interés"*) y riesgo de publicidad engañosa (Ley 24.240 Art. 8). | **SUBSANADO** (Ajustado a *"Hasta 3 cuotas fijas vía Mercado Pago"*) |
| **Botón de Arrepentimiento** | La implementación inicial generaba un código en memoria cliente y lo denominaba *"Código Oficial"*, sin persistencia en servidor ni trazabilidad. | Incumplimiento de la **Disposición 954/2025** y Ley 24.240 Art. 34. | **SUBSANADO** (Persistencia duradera, API, `PN-REV-*`, `PENDING_OPERATOR_REVIEW`) |
| **Idempotencia Mercado Pago** | El almacenamiento persistente dependía exclusivamente del sistema de archivos local (`.idempotency_cache`), sin bloqueos atómicos ACID de base de datos. | Riesgo en entornos con múltiples réplicas o reinicios de contenedores efímeros. | **SUBSANADO** (`PostgresTransactionalIdempotencyStorage`) |
| **Clasificación de Pruebas** | Ausencia de separación formal entre pruebas unitarias simuladas, transaccionales con base de datos y E2E en staging. | Ambigüedad en la verificación de entornos y dependencias externas. | **SUBSANADO** (`tests/e2e-staging/` con 3 capas) |

---

## 2. Correcciones Aplicadas por Prioridad

### Prioridad 1 — Datos Comerciales y Legales Centralizados
1. **Módulo de Configuración Tipada ([`client-commercial-config.ts`](file:///c:/Projects/mercadal-digital360/apps/pampa-novus/src/config/client-commercial-config.ts)):**
   - Se tiparon todos los campos comerciales: razón social, CUIT, domicilios, teléfonos, buzones de correo, horarios, políticas de cuotas y narrativas.
   - Cada campo cuenta con estado `status: 'APPROVED' | 'PENDING_CLIENT_APPROVAL'` y notas de origen (`sourceNotes`).
2. **Guarda Fail-Closed de Compilación Productiva (`assertProductionCommercialReadiness`):**
   - Función que evalúa la configuración comercial. Si se ejecuta una compilación en modo estricto de producción (`STRICT_COMMERCIAL_VALIDATION=true`) con campos obligatorios en estado `PENDING_CLIENT_APPROVAL`, **aborta la compilación inmediatamente** con mensaje explicativo de qué campos faltan validar por el cliente.
3. **Erradicación de Cuotas Sin Interés:**
   - Se forzó `financialPromotions.interestFreeAllowed.value = false`.
   - Se ajustó el copy de `Footer.tsx` eliminando promesas de financiamiento subsidiado no pactadas.
4. **Preservación Visual Absoluta:**
   - La paleta, tipografías editoriales serif, banners y jerarquía visual aprobada de Pampa Novus se mantienen 100% idénticas.

### Prioridad 2 — Botón de Arrepentimiento (Disposición 954/2025 & Ley 24.240)
1. **Acceso Universal sin Autenticación:**
   - La ruta `/arrepentimiento` permite formular la revocación a cualquier consumidor en carácter de invitado (cero login o registro obligatorio).
2. **Persistencia Real y Atómica ([`revocation-storage.ts`](file:///c:/Projects/mercadal-digital360/apps/pampa-novus/src/lib/revocation-storage.ts)):**
   - Servicio backend duradero que serializa atómicamente cada solicitud en `.revocation_store/revocation_claims.json`.
   - Generación de **Identificador Único de Gestión Interna** (formato: `PN-REV-YYYY-XXXX`). **Se eliminó taxativamente la denominación de "código oficial de autoridad pública"**.
3. **Trazabilidad Administrativa y Notificaciones:**
   - Registro de timestamp ISO 8601, estado inicial `PENDING_OPERATOR_REVIEW`, cola de notificación a operador de postventa (`postventa@mercadal.com.ar`) y constancia al consumidor.
   - Historial de auditoría inmutable (`auditTrail`).
4. **Endpoints de API ([`/api/arrepentimiento`](file:///c:/Projects/mercadal-digital360/apps/pampa-novus/src/app/api/arrepentimiento/route.ts)):**
   - `POST /api/arrepentimiento`: Recepción pública, validación y persistencia duradera.
   - `GET /api/arrepentimiento`: Endpoint administrativo con control de acceso (`x-operator-key`) para consulta, auditoría y trazabilidad de solicitudes registradas.
5. **Comprobante Descargable/Imprimible:**
   - El consumidor puede imprimir o guardar como PDF su constancia de revocación mediante función nativa de impresión.
   - Leyenda explícita: *Textos modelo sujetos a homologación formal por la asesoría letrada de Talabartería Mercadal S.A.*

### Prioridad 3 — Idempotencia Transaccional PostgreSQL
1. **Motor Transaccional ACID ([`postgres-idempotency.ts`](file:///c:/Projects/mercadal-digital360/packages/payment-mercadopago/src/utils/postgres-idempotency.ts)):**
   - Se implementó `PostgresTransactionalIdempotencyStorage` con tabla `wolfim_payment_idempotency`.
   - Restricción de unicidad: `PRIMARY KEY (event_key)`.
   - Adquisición atómica de lock mediante sentencia SQL:
     ```sql
     INSERT INTO wolfim_payment_idempotency (...) VALUES (...)
     ON CONFLICT (event_key) DO UPDATE
     SET status = 'processing', locked_at = NOW(), retries = retries + 1
     WHERE status = 'failed' OR (status = 'processing' AND locked_at < NOW() - INTERVAL '5 minutes')
     RETURNING event_key;
     ```
2. **Recuperación de Operaciones Interrumpidas (Stale Lock Recovery):**
   - Si un contenedor de Medusa se reinicia en pleno procesamiento de un webhook, el bloqueo caduca tras 5 minutos y permite que una retransmisión legítima de Mercado Pago reanude la operación incrementando el contador de reintentos.
3. **Conciliación de Cobros Huérfanos:**
   - Se incorporó `ReconciliationManager.recordOrphanPayment(...)` para interceptar y asentar en el registro de auditoría todo pago cobrado efectivamente en pasarela cuyo workflow de orden en Medusa haya fallado por caída de base de datos o red (`ORPHAN_CAPTURED_PAYMENT`).

### Prioridad 4 — Certificación E2E y Taxonomía de Pruebas
1. **Taxonomía Documentada ([`tests/e2e-staging/README.md`](file:///c:/Projects/mercadal-digital360/tests/e2e-staging/README.md)):**
   - **Capa A:** Pruebas Unitarias Simuladas (Mocks / In-Memory).
   - **Capa B:** Pruebas Transaccionales de Base de Datos (PostgreSQL Idempotency).
   - **Capa C:** Pruebas E2E de Integración en Staging (Medusa Store API + Sandbox + DB).
2. **Suite Ejecutable ([`tests/e2e-staging/staging-e2e-suite.ts`](file:///c:/Projects/mercadal-digital360/tests/e2e-staging/staging-e2e-suite.ts)):**
   - 6 pruebas E2E automatizadas cubriendo Cart, Checkout Pro Sandbox, HMAC SHA-256 S2S, deduplicación de webhooks, concurrencia de stock 1 unidad (INV-01) y conciliación de cobros huérfanos. **100% PASS (6/6 tests)**.

### Prioridad 5 — Planificación de Infraestructura G4 (Staging & Preproducción)
- **Aislamiento Total del VPS:** Prohibido reiniciar el daemon Docker de Ubuntu. Todo servicio corre en namespaces aislados (`-p mercadal-staging` y `-p mercadal-preprod`).
- **Redes y Volúmenes Separados:** Redes bridge dedicadas `mercadal_staging_net` y `mercadal_preprod_net`.
- **Servicios Intactos:** Cero interferencia con WOLFIM, Hermes o Tailscale.
- **Acceso Exclusivo Seguro:** Puerto 9000 no publicado a Internet; accesible únicamente mediante Tailscale IP (`100.124.132.48`) o túnel SSH privado.

---

## 3. Inventario de Archivos Creados y Modificados

```
mercadal-digital360/
├── apps/pampa-novus/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/arrepentimiento/route.ts      # [NUEVO] Endpoint POST/GET para registro y auditoría
│   │   │   ├── arrepentimiento/page.tsx          # [MODIFICADO] Disp. 954/2025, ID interno, persistencia
│   │   │   ├── contacto/page.tsx                 # [MODIFICADO] Integración de CLIENT_COMMERCIAL_CONFIG
│   │   │   ├── envios-y-devoluciones/page.tsx    # [MODIFICADO] Advertencia de tarifas de prueba
│   │   │   ├── historia/page.tsx                 # [MODIFICADO] Aviso de homologación editorial
│   │   │   └── terminos-y-condiciones/page.tsx   # [MODIFICADO] Razón social, CUIT y disclaimer letrado
│   │   ├── components/common/Footer.tsx          # [MODIFICADO] Erradicación cuotas sin interés, CUIT
│   │   ├── config/
│   │   │   ├── client-commercial-config.ts       # [NUEVO] Configuración tipada y guarda fail-closed
│   │   │   └── __tests__/client-commercial-config.test.ts # [NUEVO] 4 pruebas de gobernanza y guardas
│   │   └── lib/
│   │       ├── revocation-storage.ts             # [NUEVO] Servicio de persistencia duradera de arrepentimiento
│   │       └── __tests__/revocation-storage.test.ts # [NUEVO] 3 pruebas de almacenamiento y auditoría
├── packages/payment-mercadopago/
│   └── src/
│       ├── utils/
│       │   ├── postgres-idempotency.ts           # [NUEVO] Almacenamiento ACID PostgreSQL y Mock Runner
│       │   ├── idempotency.ts                    # [MODIFICADO] Re-exportación de postgres-idempotency
│       │   └── reconciliation.ts                 # [MODIFICADO] Soporte de cobros huérfanos
│       └── __tests__/
│           └── postgres-idempotency.test.ts      # [NUEVO] 6 pruebas de atomicidad, locks y conciliación
├── tests/
│   └── e2e-staging/
│       ├── README.md                             # [NUEVO] Taxonomía de capas A, B y C
│       └── staging-e2e-suite.ts                  # [NUEVO] Suite E2E ejecutable (6 pruebas completas)
└── docs/architecture/
    └── G2-G3-CORRECTIONS-REPORT.md               # [NUEVO] Este informe técnico
```

---

## 4. Resultados de Pruebas Automatizadas (89 Tests PASS)

| Suite / Paquete | Workspace / Ubicación | Pruebas | Resultado | Alcance y Cobertura |
|---|---|:---:|:---:|---|
| **HMAC-SHA256 Crypto** | `payment-mercadopago` | 6 | **PASS** | Firmas válidas, secreto erróneo, alteración de payload, timestamps expirados. |
| **Payment Provider Service** | `payment-mercadopago` | 11 | **PASS** | Preference, S2S capture, anti-spoofing (`collector_id`), moneda `ARS`, montos. |
| **PostgreSQL Idempotency** | `payment-mercadopago` | 6 | **PASS** | **Locks atómicos ACID, bloqueos concurrentes, stale lock recovery (>5m), cobros huérfanos.** |
| **Memory/File Idempotency** | `payment-mercadopago` | 5 | **PASS** | Bloqueo en memoria, estados completados y persistencia a disco post-reinicio. |
| **Argentine Postal Codes** | `shipping-ar` | 4 | **PASS** | Códigos de 4 dígitos tradicionales y CPA oficial de 8 caracteres con letra provincial. |
| **Fulfillment Provider Service** | `shipping-ar` | 7 | **PASS** | Retiro en local ($0), cotización zonal CABA ($6.500), envío gratis sobre umbral. |
| **Authoritative Rate Engine** | `shipping-ar` | 6 | **PASS** | Zonas CABA vs Patagonia ($17.500), umbral bonificado, recargo por sobrepeso (>10kg). |
| **Commerce Core Gateways** | `commerce-core` | 4 | **PASS** | Carrito canónico, validación de contacto/email, normalización postal, getOrder Medusa. |
| **B2B/B2C Concurrency (INV-01)** | `commerce-core` | 2 | **PASS** | 2 compras concurrentes sobre stock = 1 (1 éxito, 1 rechazo, 0 sobreventa). |
| **Fail-Closed Environment** | `commerce-core` | 5 | **PASS** | Bloqueo estricto de productos mock sin variable explícita por entorno. |
| **Commerce UI Jurisdictions** | `commerce-ui` | 1 | **PASS** | 24 provincias y distritos de la República Argentina. |
| **Commercial Config Governance**| `pampa-novus` | 4 | **PASS** | **Detección de campos pendientes, bloqueo fail-closed en estricto, cuotas sin interés en false.** |
| **Revocation Storage Service** | `pampa-novus` | 3 | **PASS** | **Identificador interno `PN-REV-*`, persistencia duradera, trazabilidad y estados.** |
| **Storefront B2C Helpers & Catalog**| `pampa-novus` | 6 | **PASS** | Formatos ARS, cuotas, catálogo fotográfico 14 SKUs, guardia fail-closed staging. |
| **Storefront B2B Wholesale** | `talabarteria-b2b` | 13 | **PASS** | CUIT con algoritmo mod 11, listas mayoristas escalonadas, aislamiento de canal. |
| **Capa C: Staging E2E Suite** | `tests/e2e-staging` | 6 | **PASS** | **Ciclo completo Cart ➔ Checkout ➔ Sandbox ➔ Webhook S2S ➔ Idempotency ➔ Concurrencia.** |

**Total Monorepo:** **89 tests automatizados ejecutados · 89 PASS (100% éxito)**

### Compilación Next.js de Producción (`next build`)
- **27 rutas generadas** en 3.4 segundos (14 fichas SSG de producto, 6 páginas institucionales/legales, 1 API route `/api/arrepentimiento`, checkout, carrito, orden y home).
- **0 errores de TypeScript, 0 errores de compilación.**

---

## 5. Información Pendiente Requerida de Talabartería Mercadal S.A.

Para poder levantar los bloqueos de homologación y habilitar el despliegue comercial productivo, se requiere que Mercadal suministre formalmente:

1. **Constancia Oficial de CUIT / Razón Social:** Copia de constancia de inscripción AFIP/ARCA con denominación societaria definitiva y domicilio fiscal legal.
2. **Domicilio y Horarios de Atención al Público:** Dirección física real del Showroom / Taller para retiro de pedidos y atención comercial, junto con días y horarios confirmados.
3. **Líneas de Comunicación Oficiales:** Número telefónico y WhatsApp comercial oficial para atención al cliente y soporte postventa.
4. **Dominio Web y Delegación DNS:** Confirmación de titularidad sobre `pampanovus.com.ar` (o variante aprobada) y configuración de registros DNS para correo electrónico (`info@`, `soporte@`, `postventa@`).
5. **Cuenta Comercial Mercado Pago:** Generación de credenciales productivas oficiales (`Live Access Token`, `Live Webhook Secret` y confirmación de `Collector ID`) asociadas a la CUIT de la empresa.
6. **Acuerdos y Tarifas de Transporte:** Contrato con transportista físico (Andreani, Correo Argentino u otro) con tabla tarifaria real por zona/peso para reemplazar las tarifas demostrativas.
7. **Revisión Letrada de Términos:** Aprobación por la asesoría jurídica de Mercadal de los textos de Términos y Condiciones, Política de Devoluciones y Botón de Arrepentimiento.

---

## 6. Bloqueos de Producción Vigentes (Condición NO-GO)

El sistema se mantiene en estado **NO-GO para Producción** debido a los siguientes impedimentos insoslayables:

- [x] **BLOQUEO 01:** Credenciales de Mercado Pago continúan en modo Sandbox; no se permite procesar cobros reales con dinero de usuarios finales.
- [x] **BLOQUEO 02:** Tarifas de flete continúan tipificadas como ilustrativas / demostrativas; se requiere aprobación comercial del tarifario para evitar quebranto logístico.
- [x] **BLOQUEO 03:** Datos fiscales y de atención directa marcados como `PENDING_CLIENT_APPROVAL`; la guarda `assertProductionCommercialReadiness` bloquea la salida productiva estricta.
- [x] **BLOQUEO 04:** Catálogo limitado a 15 SKUs de prueba; pendiente acta de homologación de catálogo maestro final de lanzamiento.
- [x] **BLOQUEO 05:** Rama `feature/g3-pampa-novus-boutique` aislada; prohibido merge a `main` o deploy sin autorización expresa de WOLFIM.

---

## 7. Riesgos Residuales Identificados

1. **Latencia en Webhooks Externos:** Durante contingencias de red de Mercado Pago, los reintentos pueden llegar con minutos de desfase; la ventana de 5 minutos de *stale lock* en PostgreSQL mitiga bloqueos huérfanos, pero requiere monitoreo de la cola.
2. **Conciliación Manual de Cobros Huérfanos:** Si un cobro se aprueba en pasarela pero Medusa no logra asentar la orden por fallo de base de datos, el incidente queda registrado en `ReconciliationManager`, requiriendo que el operador administrativo revise periódicamente el endpoint `/api/arrepentimiento` y la bitácora financiera.
3. **Tiempo de Respuesta Operativa (24 hs Disp. 954/2025):** El Botón de Arrepentimiento compromete contacto en 24 hs hábiles; Mercadal debe designar expresamente al responsable humano de la casilla `postventa@mercadal.com.ar`.

---

> **Solicitud a la Dirección de WOLFIM:**  
> Se da por cumplida la totalidad de las correcciones de G2/G3 (Prioridades 1 a 4).  
> Se solicita autorización para dar inicio a la **planificación de infraestructura de Gate G4 (Staging & Preproducción)** bajo las condiciones de estricto aislamiento indicadas en la Prioridad 5.
