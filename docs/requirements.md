# Requerimientos del Sistema — Mercadal Digital 360

## 1. Visión General del Proyecto
**Mercadal Digital 360** es una plataforma de comercio electrónico unificada, modular y autohospedada, diseñada para operar simultáneamente dos marcas comerciales independientes a través de un **único motor de backend Medusa 2**, un catálogo maestro consolidado por SKU y un inventario digital centralizado:

1. **Talabartería Mercadal (B2B)**: Portal cerrado y privado de ventas mayoristas para clientes corporativos aprobados, con listas de precios preferenciales, pedidos por volumen, cotizaciones y flujos de aprobación.
2. **Pampa Novus (B2C)**: Tienda online minorista premium de alta fidelidad estética (basada en mockup de diseño para desktop y mobile), con catálogo público, carrito, checkout minorista y medios de pago y envío de Argentina.

### 1.1. Estrategia de Infraestructura Híbrida (Local + VPS Staging)
- **Desarrollo y Storefronts Locales (PC Windows)**: Antigravity 2.0 en Windows 11 Pro para desarrollo de los storefronts Next.js 15, maquetado de alta fidelidad, control de versiones con Git y gestión del proyecto. **No se instalan Docker Desktop, WSL2, PostgreSQL ni Redis en la PC Windows**.
- **Backend y Persistencia en VPS Staging (Ubuntu 24.04 LTS)**: Medusa 2, PostgreSQL 16 y Redis 7 se ejecutan en **contenedores exclusivos y aislados** dentro del VPS existente, que ya cuenta con Docker y Docker Compose operativos.
- **Acceso Privado y Seguro**: La comunicación entre la PC local y el backend en el VPS se realiza de manera privada mediante **Tailscale** o **túneles SSH**. Ni PostgreSQL, ni Redis, ni el panel administrativo de Medusa se exponen públicamente a Internet.

---

## 2. Actores y Roles del Sistema

| Actor | Canal / Marca | Descripción y Privilegios |
|---|---|---|
| **Comprador Minorista (B2C)** | Pampa Novus | Navega el catálogo público, agrega productos al carrito, realiza checkout (invitado o registrado), paga con medios locales y consulta el estado de sus pedidos B2C. No tiene visibilidad ni acceso a precios o pedidos B2B. |
| **Cliente Comercial Aprobado (B2B)** | Talabartería Mercadal | Representante autorizado de una empresa registrada. Accede a precios mayoristas, historial de cotizaciones, pedidos por volumen y condiciones de crédito comercial. No ve pedidos B2C. |
| **Comprador Delegado de Empresa (B2B)** | Talabartería Mercadal | Empleado de una empresa B2B con límite de gasto asignado. Puede armar carritos pero requiere aprobación del administrador de su empresa si supera su cupo. |
| **Administrador de Empresa (B2B)** | Talabartería Mercadal | Gestiona usuarios internos de su empresa, aprueba carritos de sus empleados y gestiona cotizaciones comerciales. |
| **Operador de Catálogo y Logística** | Medusa Admin | Personal interno que administra productos maestros, variantes, SKU, asignación a canales de venta y niveles de inventario digital. Accede de forma privada vía Tailscale / SSH. |
| **Gerente Comercial / Administrador General** | Medusa Admin | Aprueba altas de empresas B2B, define listas de precios, aprueba o modifica cotizaciones y supervisa ventas globales. Acceso privado vía red segura. |

---

## 3. Requerimientos Funcionales

### 3.1. Catálogo Maestro Unificado
- **RF-CAT-01 (SKU Maestro)**: Cada producto y variante se identifica por un SKU único e inmutable en todo el sistema.
- **RF-CAT-02 (Atributos Compartidos)**: La información base (título, descripción técnica, especificaciones de cuero/talabartería, dimensiones, peso, imágenes primarias y galería) es compartida entre ambas marcas.
- **RF-CAT-03 (Publicación por Canal)**: La visibilidad de los productos se gobierna mediante Canales de Venta (*Sales Channels*). Ambos canales (`sc_talabarteria_b2b` y `sc_pampa_novus_b2c`) están vinculados a los productos maestros para asegurar disponibilidad homogénea.
- **RF-CAT-04 (Categorización Diferenciada)**: Posibilidad de organizar categorías y colecciones de forma diferenciada en cada storefront según su público objetivo (ej. "Línea Campo & Aperos Mayorista" vs. "Colección Urbana & Accesorios Premium").

### 3.2. Motor de Precios y Reglas Comerciales
- **RF-PRC-01 (Precio Base Minorista)**: Cada variante posee un precio base minorista expresado en pesos argentinos (ARS) que se expone públicamente en Pampa Novus.
- **RF-PRC-02 (Listas de Precios Mayoristas B2B)**: Se configuran listas de precios mayoristas asociadas exclusivamente al canal B2B y a grupos de clientes comerciales (`Customer Groups`).
- **RF-PRC-03 (Precios por Escala / Volumen)**: El motor de precios soporta tarifas escalonadas según cantidad mínima adquirida (*Tier Pricing* / `min_quantity`), coherentes con el stock disponible de cada producto.
- **RF-PRC-04 (Invisibilidad e Inaccesibilidad de Precios B2B en B2C)**: Ningún usuario anónimo o consumidor minorista de Pampa Novus puede visualizar, acceder ni inferir los precios mayoristas o las listas de Talabartería Mercadal. Esta restricción está blindada por middleware y validación en base de datos.
- **RF-PRC-05 (Cotizaciones y Solicitud de Presupuesto - RFQ)**: En el canal B2B, los clientes pueden solicitar cotizaciones especiales para pedidos a medida o volúmenes especiales, habilitando negociación bidireccional entre cliente y administrador comercial antes de consolidar la orden.

### 3.3. Inventario Digital Centralizado y Control de Concurrencia
- **RF-INV-01 (Ubicación de Stock Digital Compartido)**: Existe una única ubicación de inventario digital (`loc_digital_warehouse`) vinculada tanto al canal B2B como al canal B2C.
- **RF-INV-02 (Reserva de Stock mediante Workflows)**: La reserva de stock se realiza de forma atómica en el proceso de checkout a través del workflow oficial `completeCartWorkflow` (ejecutando `reserveInventoryStep`). No se asume a priori la ausencia absoluta de sobreventa; la prevención de sobreventa se somete a validación empírica mediante pruebas de estrés concurrente.
- **RF-INV-03 (Deducción Definitiva)**: Al confirmarse el pago (B2C) o autorizarse la orden comercial (B2B), las unidades reservadas se descuentan del balance físico del inventario digital.
- **RF-INV-04 (Restitución de Stock)**: Si una orden es cancelada mediante `cancelOrderWorkflow`, las reservas se eliminan de inmediato o se reajustan los niveles físicos mediante `deleteReservationsStep` / `adjustInventoryLevelsStep`. Si se procesa una devolución mediante `createReturnWorkflow` y `receiveReturnWorkflow`, los ítems recibidos se restituyen al inventario disponible.
- **RF-INV-05 (Aislamiento Operativo del ERP)**: El inventario digital opera como un buffer reservado para ventas online, separado operativamente del stock físico del ERP. Se prevé una interfaz de conciliación asíncrona futura (delta/batch) sin acoplar sincrónicamente el checkout con el ERP.

### 3.4. Marca 1: Talabartería Mercadal (B2B)
- **RF-B2B-01 (Portal Privado / Acceso Restringido)**: La tienda no permite compras minoristas abiertas. El catálogo de precios y el checkout requieren autenticación obligatoria y pertenencia a una empresa aprobada.
- **RF-B2B-02 (Registro y Aprobación Comercial)**: Los nuevos clientes solicitan cuenta comercial aportando CUIT, Razón Social, Condición de IVA (Responsable Inscripto / Monotributo) y datos de contacto. La cuenta permanece inactiva (`pending_approval`) hasta su validación en Medusa Admin.
- **RF-B2B-03 (Estructura Corporativa - Company Module)**: Soporte para cuentas empresa con múltiples usuarios (empleados/compradores), administradores de empresa y centros de facturación.
- **RF-B2B-04 (Límites de Gasto y Flujo de Aprobación)**: Configuración de límites de compra por empleado. Carritos que superen el límite entran en estado `pending_company_approval` dentro de la empresa antes de pasar al vendedor.
- **RF-B2B-05 (Condiciones de Pago B2B)**: Admisión de métodos comerciales diferidos: transferencia bancaria coordinada, cuenta corriente comercial y términos a 30/60 días (previo acuerdo).

### 3.5. Marca 2: Pampa Novus (B2C)
- **RF-B2C-01 (Fidelidad de Diseño y Mockup)**: Implementación pixel-perfect del diseño de referencia provisto en el workspace, con estética premium, tipografía refinada y experiencia responsiva completa (mobile-first y desktop).
- **RF-B2C-02 (Catálogo Público y Búsqueda)**: Navegación libre, filtrado por categorías, talles, colores, rangos de precio y búsqueda instantánea.
- **RF-B2C-03 (Carrito y Checkout Optimizado)**: Checkout de uno o dos pasos con soporte para compra como invitado (*guest checkout*) o registro rápido de cliente.
- **RF-B2C-04 (Medios de Pago Locales)**: Preparación para integración con Mercado Pago Argentina (pendiente de validación técnica).
- **RF-B2C-05 (Envíos Nacionales)**: Preparación para cálculo de flete dinámico por código postal (pendiente de validación técnica).

### 3.6. Seguridad, Aislamiento Multicapa y Red Privada
- **RF-SEC-01 (Defensa en Profundidad)**: La seguridad y aislamiento entre marcas NO depende únicamente de las Publishable API Keys (que son públicas en el navegador). Se implementa un esquema multicapa:
  1. *Publishable API Key*: Define el contexto de canal de venta de la petición (`sc_pampa_novus_b2c` o `sc_talabarteria_b2b`).
  2. *Tokens de Sesión / JWT*: Validación en servidor de la identidad del usuario y sus roles.
  3. *Guards de Autorización en Endpoints B2B*: Las rutas de empresa (`/store/companies`), cotizaciones (`/store/quotes`) y aprobaciones (`/store/approvals`) exigen sesión activa con pertenencia a una `Company` en estado `approved`. Solicitudes sin esta validación retornan `401 Unauthorized` o `403 Forbidden`.
  4. *Filtro Mandatorio en Consultas de Órdenes*: El endpoint de órdenes del cliente (`/store/customers/me/orders`) aplica forzosamente un filtro por el `sales_channel_id` asociado al contexto de la petición. Un cliente con el mismo email registrado en ambas marcas no puede visualizar pedidos de la otra marca.
  5. *Recálculo Server-Side de Precios*: El cliente nunca puede forzar el precio en el payload de la orden. Medusa 2 recalcula todos los precios en el servidor evaluando el canal y el grupo comercial del comprador.
- **RF-SEC-02 (Privacidad de Red de Infraestructura)**:
  - Ni PostgreSQL ni Redis exponen puertos hacia la red pública del VPS (enlace `127.0.0.1` o red interna Docker).
  - El panel administrativo (`/app` de Medusa) es accesible exclusivamente por túnel SSH o IP de la red privada **Tailscale**.

---

## 4. Requerimientos No Funcionales

### 4.1. Concurrencia e Integridad Transaccional
- **RNF-CON-01 (Manejo de Concurrencia en PostgreSQL)**: La reserva de stock en `completeCartWorkflow` debe ejecutarse bajo transacciones ACID con bloqueos de fila (`SELECT FOR UPDATE`) para evitar condiciones de carrera (*race conditions*). Se someterá a pruebas de concurrencia automatizadas para verificar su comportamiento bajo carga.

### 4.2. Recursos e Infraestructura en VPS Staging
- **RNF-RES-01 (Protección Absoluta de Servicios Existentes)**: WOLFIM, Hermes y Tailscale tienen prioridad absoluta. Los contenedores de Mercadal Staging no deben alterar, reiniciar ni sobrecargar ningún servicio existente.
- **RNF-RES-02 (No Reinstalación de Docker)**: El daemon de Docker del VPS no se reinstala ni se reinicia.
- **RNF-RES-03 (Límites Estrictos de Recursos en Staging)**: Los contenedores de Mercadal Staging contarán con límites estrictos de memoria (*hard limits* cgroup) y `oom_score_adj: 500` para que, en caso de presión extrema, el kernel termine primero los procesos de Mercadal antes de afectar a WOLFIM, Hermes o Tailscale.
- **RNF-RES-04 (Ciclo de Vida Independiente)**: El entorno de Mercadal Staging puede iniciarse (`docker compose up -d`) y detenerse (`docker compose down`) de forma 100% aislada.
- **RNF-RES-05 (Separación Explícita Staging vs Producción)**: Todas las configuraciones, volúmenes (`mercadal_staging_*`), redes (`mercadal_staging_net`) y contenedores de staging están explícitamente desacoplados de un futuro entorno de producción.

### 4.3. Compatibilidad de Entorno
- **RNF-CMP-01 (Versión de Node.js)**: Se adopta como opción primaria **Node.js 24 LTS**, validando su compatibilidad con las dependencias de Medusa 2 y Next.js 15, con **Node 22 LTS** como alternativa estable certificada.

---

## 5. Especificaciones de la Prueba de Concepto (PoC)

La PoC se ejecutará conectando los storefronts locales contra el backend desplegado en el entorno de Staging aislado del VPS, validando los **10 productos de prueba**:

### Matriz de los 10 Productos de Prueba

| # | SKU | Título del Producto | Stock Digital Inicial | Precio Minorista B2C (ARS) | Precio Mayorista B2B (Base) | Escala Mayorista B2B (Volumen Coherente) |
|---|---|---|---|---|---|---|
| 1 | `MERC-MONT-001` | Montura Criolla Tradicional Cuero Crudo | 6 | $450.000 | $320.000 | Tier Volumen (3 a 5 un.): $295.000 |
| 2 | `MERC-BOZ-002` | Bozal Trenzado Fino de Lonja | 40 | $85.000 | $58.000 | Tier Volumen (15 a 30 un.): $50.000 |
| 3 | `MERC-CABR-003` | Cabezada Criolla con Riendas | 25 | $120.000 | $82.000 | Tier Volumen (10 a 20 un.): $72.000 |
| 4 | `MERC-REB-004` | Rebenque Tradicional Cabo Madera y Plata | 20 | $95.000 | $65.000 | Tier Volumen (8 a 15 un.): $58.000 |
| 5 | `MERC-CINCH-005` | Cincha de Piola Pura Lana | 60 | $65.000 | $42.000 | Tier Volumen (20 a 50 un.): $36.000 |
| 6 | `MERC-ESTR-006` | Estribos Arequeros de Alpaca | 10 | $180.000 | $125.000 | Tier Volumen (4 a 8 un.): $112.000 |
| 7 | `MERC-CINT-007` | Cinturón Gaucho Bordado con Rastras | 45 | $75.000 | $48.000 | Tier Volumen (15 a 35 un.): $40.000 |
| 8 | `MERC-MAT-008` | Matera de Cuero Vacuno Repujado | 30 | $110.000 | $74.000 | Tier Volumen (10 a 25 un.): $64.000 |
| 9 | `MERC-CUCH-009` | Cuchillo Criollo Acero Carbono con Vaina | 15 | $140.000 | $95.000 | Tier Volumen (5 a 12 un.): $84.000 |
| 10 | `MERC-BAST-010` | Basto Criollo Relleno Especial | 8 | $380.000 | $260.000 | Tier Volumen (3 a 6 un.): $240.000 |

### Los 6 Criterios de Aceptación de la PoC:
1. **Catálogo Maestro Común**: Ambos storefronts consultan y reciben los mismos 10 productos maestros identificados por sus SKUs.
2. **Precios Diferenciados y Escalas Validadas**: Consulta B2C devuelve precio minorista; cliente B2B autenticado recibe precio mayorista base; compra con cantidad dentro del tier de volumen aplica automáticamente el descuento correspondiente.
3. **Condiciones Comerciales Exclusivas**: Pampa Novus permite checkout minorista directo; Talabartería Mercadal bloquea compras a usuarios no autorizados o sin empresa aprobada.
4. **Prueba de Concurrencia e Inventario Compartido**: Prueba de estrés con solicitudes simultáneas sobre stock escaso (ej. 2 unidades restantes de `MERC-MONT-001`). Verificación empírica de cuántas reservas se otorgan y validación de que el stock no caiga por debajo de cero.
5. **Consistencia ante Cancelaciones y Devoluciones**: Cancelación de orden en B2B mediante `cancelOrderWorkflow` restituye inmediatamente el stock disponible para B2C; devolución en B2C reajusta el inventario digital compartido.
6. **Pruebas de Acceso Cruzado y Seguridad (Penetration / Boundary Tests)**:
   - Intento de consulta a cotizaciones B2B con token B2C -> Rechazado (`403 Forbidden`).
   - Intento de inyectar precio mayorista en carrito B2C -> Desestimado por recálculo en servidor.
   - Consulta de órdenes de un usuario con mismo email en ambas marcas -> Cada storefront solo visualiza las órdenes de su propio `sales_channel_id`.
