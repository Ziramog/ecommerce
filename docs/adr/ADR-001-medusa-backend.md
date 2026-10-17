# ADR-001: Scaffold e Integración del Backend Medusa 2 en Monorepo

## Estado
Aceptado

## Contexto
El proyecto Mercadal Digital 360 requiere un backend unificado de comercio electrónico basado en Medusa 2 (`apps/backend`) para servir a dos canales comerciales: Talabartería Mercadal (B2B) y Pampa Novus (B2C), compartiendo un catálogo maestro por SKU y un inventario digital centralizado.

El repositorio raíz ya cuenta con una estructura de monorepo establecida (`npm workspaces`, `turbo.json`, `tsconfig.base.json`, paquetes `@mercadal/*` y lockfile único). La herramienta oficial `create-medusa-app` genera por diseño su propio monorepo raíz con `pnpm-workspace.yaml`, sobrescribiendo archivos existentes si se ejecuta en el directorio de trabajo.

Adicionalmente, el entorno local de desarrollo opera con Windows 11 sin Docker local, mientras que la persistencia (PostgreSQL 16 y Redis 7) reside en contenedores dedicados en el VPS de Staging.

## Decisiones

1. **Versión de Medusa 2**:
   Se fija explícitamente la versión **`2.21.2`** (última versión estable verificada) para todos los paquetes `@medusajs/*` (`@medusajs/framework`, `@medusajs/medusa`, `@medusajs/dashboard`, `@medusajs/cli`, etc.), evitando el uso de etiquetas flotantes (`latest`).

2. **Versión de Node.js**:
   Se adopta estrictamente **Node.js 22 LTS** (`v22.23.3` instalado localmente vía `fnm`). Se restringe el rango en el `package.json` raíz a `"engines": { "node": "22.x" }`, acompañado de `.nvmrc` con `22.23.3` y `.npmrc` con `engine-strict=true` para forzar la compatibilidad en todas las instalaciones.

3. **Gestor de Paquetes y Lockfile Único**:
   Se utiliza **npm 10.9.9** con `npm workspaces`. Todas las dependencias del backend se integran en el lockfile único de la raíz (`package-lock.json`), garantizando consistencia y cero lockfiles duplicados. El paquete se nombra `@mercadal/backend`.

4. **Estrategia de Scaffold Fuera del Repo y Trasplante**:
   El scaffold se ejecutó en un directorio temporal externo (`%LOCALAPPDATA%\Temp\mercadal-scaffold`) utilizando `npx create-medusa-app@latest mercadal --skip-db --no-browser --use-npm --version 2.21.2`. Desde allí se trasplantó únicamente el contenido funcional de `apps/backend/`.

5. **Elementos Descartados del Starter**:
   - **Storefront Next.js (`apps/storefront`)**: Se descartó respondiendo negativamente (`N`) al prompt interactivo del scaffold, ya que el proyecto cuenta con storefronts independientes ya diseñados (`pampa-novus` y `talabarteria-b2b`).
   - **Base de Datos Local / Migraciones (`--skip-db`)**: Se omitió la creación de base de datos local SQLite/PostgreSQL y la ejecución de migraciones en la máquina de desarrollo, respetando el modelo de persistencia centralizada en Staging.
   - **Archivos raíz del starter**: Se descartaron `package.json` raíz del starter, `pnpm-workspace.yaml`, `.git`, y `node_modules` temporales.

6. **Configuración de Entorno y Credenciales**:
   - `medusa-config.ts` lee credenciales estrictamente desde variables de entorno (`process.env.DATABASE_URL`, `process.env.REDIS_URL`, `process.env.JWT_SECRET`, `process.env.COOKIE_SECRET`). Se agregó explícitamente `redisUrl: process.env.REDIS_URL` para conectividad con Redis en staging.
   - Se versiona exclusivamente `apps/backend/.env.example` con nombres de variables y sin credenciales reales. El archivo `.env` está estrictamente ignorado por `.gitignore`.

7. **Configuración de TypeScript (`tsconfig.json`)**:
   Se preservó el `tsconfig.json` autónomo provisto por el framework de Medusa 2 (`module: Node16`, `outDir: ./.medusa/server`), sin forzar la herencia de `tsconfig.base.json`, dado que Medusa 2 requiere directivas de compilación específicas para su servidor y admin dashboard.

## Consecuencias
- El monorepo mantiene su integridad estructural, pipelines de Turbo y paquetes compartidos sin colisiones.
- La compilación `npm run build --workspace apps/backend` y la verificación de tipos `npx tsc --noEmit -p apps/backend` funcionan limpiamente sin requerir conexión a base de datos.
- Las tareas de conexión a base de datos, ejecución de migraciones y arranque de servicio quedan delegadas a los bloques subsiguientes (B2 y B3 en Staging VPS).
