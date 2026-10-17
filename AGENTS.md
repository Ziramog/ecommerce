# Mercadal Digital 360 — Agent Guidelines & Project Conventions

## Role & System Persona
Actúa como arquitecto de software senior y desarrollador full-stack especialista en Medusa 2, Next.js 15, TypeScript, PostgreSQL y comercio electrónico B2B/B2C.

## Project Overview
- **Project**: Mercadal Digital 360
- **Objective**: Plataforma de comercio electrónico autohospedada con dos marcas comerciales independientes que comparten un catálogo maestro de productos unificado por SKU y un único inventario digital común.
- **Architecture**: Unified Medusa 2 Backend + Dual Next.js 15 Storefronts + PostgreSQL 16 + Redis 7.

## Definitive Monorepo Layout
```
mercadal-digital360/
├── apps/
│   ├── backend/               # Medusa 2 headless e-commerce backend (se crea en M360-010)
│   ├── pampa-novus/           # Next.js 15 storefront B2C (Retail Premium)
│   └── talabarteria-b2b/      # Next.js 15 storefront B2B (Mayorista privado)
├── packages/
│   ├── shared-types/          # Tipos de dominio TypeScript compartidos
│   ├── eslint-config/         # Configuración centralizada de ESLint
│   └── typescript-config/     # Presets base y Next.js de TypeScript
├── docs/                      # Documentación arquitectónica, requisitos y plan maestro
│   └── historical/            # Archivos y briefs históricos archivados
├── package.json               # Monorepo root package.json (npm workspaces)
├── package-lock.json          # Lockfile único del gestor de paquetes npm
├── turbo.json                 # Configuración del pipeline de Turborepo
└── tsconfig.base.json         # Configuración base de TypeScript
```

## Brands & Domain Principles
1. **Talabartería Mercadal (B2B)**:
   - Portal de ventas mayoristas B2B privado.
   - Acceso restringido a clientes comerciales aprobados, listas de precios mayoristas escalonadas (volumen), cotizaciones (RFQ) y flujos de aprobación comercial.
   - No opera como tienda minorista; sales channel: `sc_talabarteria_b2b`.
2. **Pampa Novus (B2C)**:
   - E-commerce minorista B2C premium con identidad y diseño visual propio.
   - Implementación fiel del mockup de referencia provisto en el workspace, responsive desktop y mobile.
   - Catálogo, filtros, búsqueda por facetas, carrito, checkout para consumidor final, cuentas de clientes y pasarelas de pago argentinas; sales channel: `sc_pampa_novus_b2c`.
3. **Catálogo Maestro & Inventario Unificado**:
   - Catálogo maestro compartido unificado por SKU.
   - Stock digital único reservado para ventas online y separado operativamente del ERP físico existente (conciliación diferida).
   - Precios, identidades, condiciones comerciales y flujos de pedidos estrictamente particionados por marca/canal.

## Infrastructure Model (Hybrid Local & Staging VPS)
- **Local PC (Windows 11 / Antigravity 2.0)**:
  - Desarrollo de storefronts Next.js 15, maquetado UI, gestión Git y orquestación del proyecto.
  - **No** se instalan Docker Desktop, WSL2, PostgreSQL ni Redis en la PC Windows.
- **Staging VPS (Ubuntu 24.04 LTS)**:
  - Aloja Medusa 2, PostgreSQL 16 y Redis 7 en **contenedores exclusivos de Staging**.
  - **Namespace exclusivo**: todos los contenedores, redes y volúmenes tienen prefijo obligatorio `mercadal-staging-*` (`mercadal-staging-postgres`, `mercadal-staging-redis`, `mercadal-staging-medusa`).
  - **Staging a demanda**: política `restart=no` en todos los contenedores de staging (no quedan ejecutándose de fondo ni arrancan automáticamente tras reboot).
  - **Red aislada**: red Docker bridge dedicada `mercadal_staging_net`.
  - **Sin exposición pública**: cero puertos publicados a Internet. PostgreSQL, Redis y Medusa Admin son estrictamente privados.
  - **Acceso seguro**: conexión mediante Tailscale mesh IP (`http://100.124.132.48:9000`) o túnel SSH local (`http://127.0.0.1:9000` en puerto libre local).

## Mandatory Operating Rules
- **Proteger servicios existentes del VPS**: WOLFIM, Hermes y Tailscale deben permanecer completamente intactos, funcionales y sin cambios en sus puertos ni recursos.
- **No reinstalar ni reiniciar el daemon Docker**: prohibido ejecutar comandos que reinicien o reinstalen Docker en el VPS.
- **Cero interferencia con contenedores existentes**: nunca inspeccionar, detener, modificar ni borrar contenedores, redes, volúmenes o configuraciones ajenas a Mercadal.
- **Autorización previa obligatoria**: nunca ejecutar comandos SSH remotos ni aplicar cambios en el VPS sin aprobación explícita del usuario.
- **Separación estricta Staging vs Producción**: Staging y los futuros entornos de producción deben mantenerse aislados en namespaces, puertos, volúmenes y configuraciones.
- **Cero secretos en Git / Cero exposición en logs**: nunca commitear credenciales reales, archivos `.env` privados ni claves API. Nunca imprimir secretos en chat, consola o logs.
- **No commit / push sin autorización explícita**: no hacer push al remoto (actualmente no existe remoto configurado).
- **Verificación de build y lint**: correr verificaciones de build y lint antes de proponer despliegues o cierres de milestones.

## Reglas de Trabajo & Metodología
- Trabajar por etapas con aprobación previa.
- Crear arquitectura mantenible, código modular, tipado estricto con TypeScript, documentación y control Git.
- No modificar otros proyectos ni ejecutar operaciones destructivas.
- No instalar herramientas globales ni levantar contenedores sin autorización.

## Prueba de Concepto Obligatoria (PoC — 10 Productos de Prueba)
Antes de diseñar la totalidad de las pantallas, validar con los 10 productos de prueba que:
1. Ambos storefronts consultan y reciben el mismo catálogo maestro unificado por SKU.
2. Un mismo SKU tiene precio mayorista (Talabartería) y precio minorista (Pampa Novus) diferenciado.
3. Cada storefront aplica únicamente sus condiciones comerciales y visibilidad de canal.
4. Las compras y reservas descuentan del inventario digital compartido sin sobreventa.
5. Las operaciones concurrentes, cancelaciones y devoluciones mantienen la consistencia del stock.
6. El acceso a información comercial, cotizaciones (RFQ) y cuentas está estrictamente particionado por marca.

## Referencias Oficiales & Integraciones
- **Medusa Documentation**: https://docs.medusajs.com/
- **Starters de referencia**:
  - DTC Starter: https://github.com/medusajs/dtc-starter
  - B2B Starter: https://github.com/medusajs/b2b-starter
  - *Regla*: No combinar a ciegas ambos starters (ambos traen backend propio). Usarlos como referencia de arquitectura para consolidar las funciones en un único backend Medusa 2. Evitar repositorios archivados o deprecados.
- **Integraciones futuras (fases posteriores)**:
  - Mercado Pago Argentina (checkout y webhooks).
  - Mercado Libre (sincronización de catálogo e inventario).
  - Envíos y logística nacional.
  - Facturación electrónica ARCA / AFIP.
  - *Regla*: Investigar viabilidad, distinguir plugins comunitarios de desarrollos a medida y no asumir compatibilidad sin pruebas en staging.

## Model Preferences (Antigravity CLI)
- Implementación compleja / fix arquitectural: `gemini-3.8-flash`
- Auditoría interna / review / validación: `gemini-3.7-flash`
- Refactor mecánico / formateo: `gemini-3.5-flash-lite`

## Architecture Documents Reference
- [Architecture Blueprint](file:///c:/Projects/mercadal-digital360/docs/architecture.md)
- [Requirements & Specifications](file:///c:/Projects/mercadal-digital360/docs/requirements.md)
- [Implementation Plan & PoC](file:///c:/Projects/mercadal-digital360/docs/implementation-plan.md)
- [Historical Agent Brief (Archived)](file:///c:/Projects/mercadal-digital360/docs/historical/AGENTS.md.txt)
