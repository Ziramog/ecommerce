# G3-REPORT — Informe de Entrega Pampa Novus Boutique Launch (Gate G3 — Fase No Transaccional)

**Proyecto:** WOLFIM Commerce Core — Caso de Uso Piloto: Pampa Novus B2C / Talabartería Mercadal S.A.  
**Fecha:** 23/10/2026 · **Gate:** G3 (Fase No Transaccional Autorizada)  
**Rama:** `feature/g3-pampa-novus-boutique`  
**Estado:** IMPLEMENTADO · 26 RUTAS COMPILADAS CON ÉXITO (`next build` PASS) · 70/70 TESTS MONOREPO PASS  

---

## 1. Resumen Ejecutivo de la Entrega

En estricto cumplimiento de la **Autorización Condicionada de Gate G3** dictada por WOLFIM:
- Se implementaron todas las **páginas institucionales y editoriales** requeridas para la experiencia boutique de Pampa Novus.
- Se incorporaron todos los **componentes legales y normativos argentinos obligatorios**, destacando el **Botón de Arrepentimiento** (Resolución 424/2020 SCI y Ley 24.240 Art. 34).
- Se preparó y estructuró el **Catálogo Maestro de 15 SKUs Priorizados**, con datos operativos de producto, fichas técnicas, medidas, precios retail ARS y activos fotográficos de estudio.
- Se mantuvieron **completamente intactas las restricciones vinculantes**: cero cobros o pasarelas de pago reales activadas, cero transportistas externos contratados, cero despliegues a producción y cero fusiones de ramas.

---

## 2. Páginas Institucionales y Legales Creadas

Se crearon 5 nuevas rutas estáticas/interactivas en `apps/pampa-novus/src/app` respetando la identidad visual aprobada (paleta espresso/crema/arena, serif Cormorant/editorial, espaciados generosos y total accesibilidad):

```
apps/pampa-novus/src/app/
├── arrepentimiento/          # Botón de Arrepentimiento oficial (Res. 424/2020)
├── terminos-y-condiciones/   # Bases legales de contratación y datos de la empresa
├── envios-y-devoluciones/    # Guía logística de zonas, tarifas base y 30 días de cambio
├── contacto/                 # Showroom Recoleta, horarios, WhatsApp y formulario
└── historia/                 # Narrativa de marca, oficio del cuero y platería criolla
```

### A. Botón de Arrepentimiento (`/arrepentimiento`)
- **Marco Normativo:** Resolución 424/2020 de la Secretaría de Comercio Interior y Art. 34 de la Ley 24.240 de Defensa del Consumidor.
- **Funcionalidad:**
  - Formulario interactivo con validación de campos: Nombre, DNI/CUIT, Email, Teléfono, Número de Pedido/Factura, Fecha de entrega, Detalle de piezas a revocar, Motivo (opcional).
  - Generación instantánea de **Código de Gestión Oficial** (ej. `REV-2026-XXXXXX`) con fecha y hora exacta de registro.
  - Especificación de las condiciones legales: **Costo de flete de devolución $0 a cargo de Talabartería Mercadal**, puesta a disposición del producto en su embalaje y compromiso de contacto dentro de las 24 horas hábiles.
  - Enlace al portal de la Dirección Nacional de Defensa del Consumidor.

### B. Términos y Condiciones Generales (`/terminos-y-condiciones`)
- **Identificación Corporativa:** Talabartería Mercadal S.A., CUIT 30-71234567-8, domicilio legal en Av. Alvear 1850, Recoleta, CABA.
- **Secciones Jurídicas:**
  1. Identificación y titularidad de la empresa.
  2. Ámbito de aplicación (exclusivo consumidor final B2C; canal mayorista derivado a Talabartería Mercadal B2B).
  3. Precios en Pesos Argentinos (ARS) con IVA (21%) incluido.
  4. Medios de pago autorizados (Mercado Pago Checkout Pro, transferencias bancarias).
  5. Despachos y recepción por mayor de 18 años con DNI.
  6. Derecho de revocación y acceso permanente al Botón de Arrepentimiento.
  7. Garantía legal de 6 meses (Ley 24.240 Art. 11) y aclaración sobre la naturaleza viva y artesanal del cuero vacuno curtido al tanino y la platería cincelada.
  8. Protección de datos personales (Ley 25.326).
  9. Jurisdicción de los Tribunales Ordinarios en lo Comercial de CABA.
- **Aviso de Gobernanza:** Se incluye cláusula explícita advirtiendo que el texto es un modelo de referencia operativo sujeto a revisión y aprobación formal letrada por parte de Talabartería Mercadal S.A.

### C. Envíos y Devoluciones (`/envios-y-devoluciones`)
- **Matriz de Zonas y Plazos de Entrega:**
  - CABA: 1-2 días hábiles · Tarifa de referencia $6.500 ARS.
  - GBA: 2-3 días hábiles · Tarifa de referencia $8.500 ARS.
  - Centro (Santa Fe, Córdoba, Entre Ríos, La Pampa): 3-5 días hábiles · Tarifa $11.500 ARS.
  - Cuyo (Mendoza, San Juan, San Luis): 4-6 días hábiles · Tarifa $13.500 ARS.
  - NOA / NEA: 4-7 días hábiles · Tarifa $14.500 ARS.
  - Patagonia y Tierra del Fuego: 5-9 días hábiles · Tarifa $17.500 ARS.
- **Beneficio de Envío Sin Cargo:** Umbrales claros ($150.000 para CABA/GBA, $200.000 / $250.000 para el interior).
- **Retiro en Showroom CABA:** Sin costo ($0 ARS) previa coordinación.
- **Política de Cambios:** 30 días corridos para cambios de talle o modelo de pieza.
- **Aviso:** Mención expresa de que las tarifas son ilustrativas y se cotizan autoritativamente en el checkout según peso y dimensiones.

### D. Contacto & Showroom (`/contacto`)
- **Ubicación:** Av. Alvear 1850, Recoleta, CABA (visitas personalizadas con cita previa).
- **Horarios:** Lunes a Viernes de 10:00 a 19:00 hs, Sábados de 10:00 a 14:00 hs.
- **Canales:** Teléfono y WhatsApp oficial (+54 9 11 5555-7267), emails `info@pampanovus.com.ar` y `soporte@pampanovus.com.ar`.
- **Formulario Interactivo:** Envío de consultas por motivo (asesoramiento en monturas, estado de pedido, regalos de autor) con confirmación visual.
- **Derivación Mayorista:** Banner informativo para clientes B2B con enlace al portal de Talabartería Mercadal.

### E. Nuestra Historia (`/historia`)
- **Narrativa Editorial:** Linaje de la talabartería criolla tradicional y su consagración como marca boutique contemporánea.
- **Pilares del Oficio:** Selección de cueros de curtido vegetal al extracto de quebracho, costuras tradicionales a lezna y dos agujas con hilo encerado, herrajes forjados y platería cincelada a mano en alpaca maciza y plata 925.
- **Integración de Fotografía Real:** Uso de los activos cinematográficos aprobados de monturas, cinturones y aperos.

---

## 3. Actualización de Navegación y Footer

- **Footer (`apps/pampa-novus/src/components/common/Footer.tsx`):**
  - Se incorporó un **bloque destacado reglamentario del Botón de Arrepentimiento** con ícono de escudo, texto legal claro y botón directo a `/arrepentimiento`.
  - Se vincularon todos los enlaces institucionales a sus rutas definitivas (`/historia`, `/envios-y-devoluciones`, `/contacto`, `/terminos-y-condiciones`).
  - Se añadió la razón social oficial y CUIT: *Talabartería Mercadal S.A. CUIT 30-71234567-8*.
  - Se incluyó enlace directo al portal oficial de Defensa del Consumidor de la Nación.
- **Navbar (`apps/pampa-novus/src/components/common/Navbar.tsx`):**
  - Los enlaces "NUESTRA HISTORIA" y "CONTACTO" ahora dirigen a las rutas canónicas `/historia` y `/contacto`.

---

## 4. Estructuración del Catálogo Maestro de 15 SKUs Priorizados

Siguiendo el contrato operativo de datos estipulado en `capa03.md`, se consolidaron los **15 SKUs maestros** que conforman el catálogo comercial unificado entre Pampa Novus (B2C) y Talabartería Mercadal (B2B):

| SKU | Denominación del Producto | Categoría | Precio B2C (ARS) | Precio B2B (ARS) | Canal | Stock Digital | Foto de Estudio Asociada |
|---|---|---|:---:|:---:|:---:|:---:|---|
| **SKU-CRI-001** | Montura Criolla de Trabajo en Suela | Monturas Criollas | $450.000 | $320.000 | Dual | 1 (INV-01) | `montura-completa-trabajo.jpg` |
| **SKU-DUAL-002** | Bozal de Cuero Crudo Trenzado 8 Cabos | Bozales & Riendas | $85.000 | $55.000 | Dual | 25 | `cabezada-cuero.jpg` |
| **SKU-B2C-003** | Cinturón de Carpincho con Pasador de Alpaca | Cinturones & Marroquinería | $120.000 | *Excluido* | B2C | 15 | `cinturon-carpincho-alpaca.jpg` |
| **SKU-B2B-004** | Rollo de Lonja Vacuna Curtida (Pack x10) | Materias Primas / Sogueo | *Excluido* | $190.000 | B2B | 50 | `rollo-lonja-vacuna-pack-x10.jpg` |
| **SKU-DUAL-005** | Estribos Chaqueños de Acero Inoxidable | Estribos & Aperos | $65.000 | $42.000 | Dual | 30 | `estribos-acero-cuero.jpg` |
| **SKU-DUAL-006** | Cinchón de Lona Reforzado y Traba Cuero | Aperos de Campo | $38.000 | $24.000 | Dual | 100 | `riendas-cuero-vacuno.jpg` |
| **SKU-DUAL-007** | Freno Criollo Cabeza de Moro Forjado | Estribos & Aperos | $95.000 | $68.000 | Dual | 20 | `freno-criollo-cabeza-de-moro.jpg` |
| **SKU-DUAL-008** | Manta Sudadero de Lana Pura de Oveja | Aperos de Campo | $52.000 | $35.000 | Dual | 40 | `manta-sudadero-lana-pura.png` |
| **SKU-DUAL-009** | Cuchillo Criollo Vaina Repujada Artesanal | Platería & Cuchillería | $110.000 | $75.000 | Dual | 8 | `cuchillo-criollo-vaina-repujada.jpg` |
| **SKU-DUAL-010** | Grasa de Potro Filtrada para Cuero (500g) | Cuidado del Cuero | $12.000 | $7.500 | Dual | 200 | `grasa-de-potro-cuero-500g.png` |
| **SKU-B2C-011** | Mate Imperial de Calabaza con Alpaca | Regalos de Autor | $98.000 | *Excluido* | B2C | 20 | `mate-imperial-alpaca.jpg` |
| **SKU-DUAL-012** | Cinturón de Polo Guarda Pampa Bordado | Cinturones & Marroquinería | $78.000 | $48.000 | Dual | 35 | `cinturon-polo.jpg` |
| **SKU-DUAL-013** | Pechera Criolla en Tiento Crudo Tejida | Aperos de Campo | $135.000 | $89.000 | Dual | 12 | `pechera-tejida-artesanal.jpg` |
| **SKU-B2C-014** | Cuchillo Verijero en Alpaca y Guayacán | Platería & Cuchillería | $145.000 | *Excluido* | B2C | 10 | `cuchillo-artesanal-alpaca.jpg` |
| **SKU-DUAL-015** | Riendas Criollas de Cuero con Azotera | Bozales & Riendas | $72.000 | $46.000 | Dual | 28 | `riendas-cuero-vacuno.jpg` |

- **Verificación de Aislamiento de Canales:**
  - El producto mayorista `SKU-B2B-004` (Rollos de lonja) no tiene precio B2C ni se exhibe en el storefront Pampa Novus.
  - Los productos exclusivos minoristas (`SKU-B2C-003`, `SKU-B2C-011`, `SKU-B2C-014`) no poseen precio mayorista en la lista de precios B2B.
  - Los 11 productos duales comparten el stock digital unificado y aplican precios minoristas al consumidor final sin mostrar márgenes mayoristas.

---

## 5. Verificación de Compilación y Suites de Pruebas

### A. Compilación Next.js de Producción (`next build`)
La compilación se completó exitosamente en **3.4 segundos**:
- **Total de Rutas Generadas:** 26 rutas (estáticas, dinámicas y SSG pre-renderizadas).
- **Rutas Individuales de Producto:** 14 rutas generadas (`/productos/montura-criolla-de-trabajo`, `/productos/mate-imperial-alpaca`, etc.).
- **Rutas Institucionales:** 5 rutas estáticas compiladas (`/arrepentimiento`, `/terminos-y-condiciones`, `/envios-y-devoluciones`, `/contacto`, `/historia`).
- **Errores de Tipos TypeScript:** 0 errores.
- **Violaciones de ESLint:** 0 violaciones.

### B. Pruebas Automatizadas del Monorepo (70 Tests PASS)
- `packages/payment-mercadopago`: 22/22 PASS (HMAC, Idempotencia Durable, Anti-spoofing, Moneda, Montos).
- `packages/shipping-ar`: 17/17 PASS (Códigos postales, Cotizador de zonas, Excedente de peso, Retiro gratis).
- `packages/commerce-core`: 11/11 PASS (Gateway de carritos, Concurrencia de stock 1 unidad, Guardias fail-closed).
- `packages/commerce-ui`: 1/1 PASS (Jurisdicciones argentinas).
- `apps/pampa-novus`: 6/6 PASS (Helpers, Formatos ARS, Cuotas, Catálogo y guardias de staging).
- `apps/talabarteria-b2b`: 13/13 PASS (Validación CUIT, Escala de volumen, Aislamiento de canal mayorista).
- **Total de Pruebas Automatizadas:** **70/70 PASS (100% éxito)**

---

## 6. Estado de Cumplimiento de Restricciones

- **Cero Pasarelas de Pago Reales:** Operación exclusivamente en modo de prueba / emulación y sandbox.
- **Cero Proveedores de Transporte Reales:** Tarifas logísticas desacopladas y señaladas como demostrativas sin contratación comercial.
- **Cero Despliegue en Producción:** El trabajo reside exclusivamente en la rama de desarrollo `feature/g3-pampa-novus-boutique`.
- **Cero Fusión de Ramas:** La rama no ha sido fusionada con `main`.
- **Protección de VPS Staging:** Los contenedores en Staging se mantienen con política `restart=no` sin alteraciones.

---

> **Conclusión:**  
> La fase no transaccional de **Gate G3** queda íntegramente implementada, verificada y documentada, lista para la revisión y aprobación formal del equipo WOLFIM.
