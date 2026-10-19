# Runbook Operativo — Medusa 2 Staging (`mercadal-staging`)

Este runbook documenta los procedimientos operativos estándar para el entorno de Staging de Mercadal Digital 360 en el VPS (`100.124.132.48`).

---

## 1. Principios y Políticas de Seguridad
- **Namespace estricto**: Todos los servicios, contenedores, volúmenes y redes utilizan el prefijo `mercadal-staging-*`.
- **Coexistencia con WOLFIM y Hermes**: Prohibido alterar o reiniciar el daemon de Docker, o interferir con contenedores de WOLFIM.
- **Arranque manual a demanda (`restart: "no"`)**: Los contenedores de staging no arrancan automáticamente tras reinicio del servidor ni quedan en segundo plano consumiendo recursos cuando no se utilizan.
- **Sin exposición pública**: Los puertos están vinculados exclusivamente a la IP privada de Tailscale (`100.124.132.48:9000`) o no están publicados al host (PostgreSQL y Redis residen exclusivamente en `mercadal_staging_net`).
- **Cero secretos en Git**: Las credenciales reales residen en `~/mercadal-staging/.env.staging` y `~/mercadal-staging/.env.medusa.staging` con permisos `600`.

---

## 2. Ubicación de Archivos en el VPS
- Directorio de trabajo en el VPS: `/home/hermes/mercadal-staging/`
- Archivo de composición: `/home/hermes/mercadal-staging/docker-compose.staging.yml`
- Variables de entorno base: `/home/hermes/mercadal-staging/.env.staging`
- Variables de entorno Medusa: `/home/hermes/mercadal-staging/.env.medusa.staging`

---

## 3. Comandos Operativos Paso a Paso

### 3.1. Construcción de la Imagen (`docker build`)
La imagen se construye en el VPS bajo límites estrictos de CPU y memoria para proteger la estabilidad de los servicios productivos de WOLFIM:

```bash
# En el VPS (~/mercadal-staging/build-context o ruta del código exportado):
docker build \
  --memory=2g \
  --cpu-quota=150000 \
  --build-arg GIT_SHA=<full_sha> \
  -f apps/backend/Dockerfile \
  -t mercadal-staging-medusa:2.21.2-<shortsha> .
```

### 3.2. Arranque del Servicio (`up -d`)
El arranque se realiza de forma dirigida sin recrear ni reiniciar contenedores de persistencia innecesariamente:

```bash
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml up -d medusa-api
```

Para levantar la totalidad del stack de staging si PostgreSQL y Redis están detenidos:
```bash
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml up -d
```

### 3.3. Monitoreo de Logs en Vivo (`logs -f`)
Para inspeccionar los registros de inicio y ejecución de Medusa en tiempo real:

```bash
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml logs -f medusa-api
```

### 3.4. Verificación de Salud (`healthcheck`)
Inspeccionar el estado del contenedor y su endpoint de salud:

```bash
# Estado en Docker Compose:
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml ps

# Prueba directa HTTP al endpoint /health (desde el VPS o PC conectada a Tailscale):
curl -i http://100.124.132.48:9000/health
```
Respuesta esperada: `HTTP/1.1 200 OK` con cuerpo `OK`.

### 3.5. Ejecución de Migraciones (`db:migrate`)
Las migraciones deben ejecutarse siempre dentro del contenedor de Medusa en el VPS (la base de datos no tiene puertos expuestos al host):

```bash
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml exec medusa-api npx medusa db:migrate
```

### 3.6. Creación de Usuario Administrador
Para dar de alta el primer usuario de acceso al Admin Dashboard (`/app`):

```bash
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml exec -e MEDUSA_ADMIN_PASSWORD="<password>" medusa-api npx medusa user -e "<email>" -p "$MEDUSA_ADMIN_PASSWORD"
```
*(Nota: Pasar la contraseña por variable de entorno temporal del comando para evitar que quede registrada en el historial o en texto plano).*

### 3.7. Carga de Semillas / Seed de Staging (10 SKU de PoC)

> [!WARNING]
> **PROHIBIDO ejecutar el seed de demo del starter (`seed-demo-products.ts`) en Staging.**
> Los 50 productos sintéticos contaminan los conteos de inventario y falsean las pruebas de concurrencia e inconsistencias de precio. Dicho script ha sido neutralizado y archivado en `docs/historical/`.

Para sembrar la configuración comercial (2 sales channels, 1 ubicación de stock, 2 publishable keys) y los **10 SKU reproducibles con inventario controlado**:

> [!IMPORTANT]
> **Guardas de Seguridad Fail-Closed**: Dado que el contenedor corre en `NODE_ENV=production`, el script aborta inmediatamente sin mutaciones si no se pasan explícitamente ambas variables: `MERCADAL_SEED_ENV=staging` y `ALLOW_DESTRUCTIVE_SEED=true`. Además, el script cuenta con un pre-flight audit estricto que sólo admite sanear artefactos conocidos del starter dentro de umbrales máximos autorizados.

```bash
cd ~/mercadal-staging
# Opción 1 (Recomendada CLI directa en runtime con JS compilado e horneado):
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml exec -e MERCADAL_SEED_ENV=staging -e ALLOW_DESTRUCTIVE_SEED=true medusa-api npx medusa exec ./src/scripts/seed-staging.js

# Opción 2 (Script de package.json para runtime compilado):
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml exec -e MERCADAL_SEED_ENV=staging -e ALLOW_DESTRUCTIVE_SEED=true medusa-api npm run seed:runtime
```

Para auditar y verificar el estado comercial mediante Admin API autenticada:
```bash
cd ~/mercadal-staging
bash ~/mercadal-staging/verify-seed.sh
```

### 3.8. Detención del Servicio (`stop` vs `down` — ¡SIN `-v`!)
> [!CAUTION]
> **NUNCA** ejecutar `docker compose down -v`. La bandera `-v` elimina los volúmenes persistentes (`mercadal_staging_pgdata` y `mercadal_staging_redisdata`), causando pérdida irrecuperable de la base de datos y configuraciones.

Para detener **únicamente** el backend de Medusa sin alterar la ejecución de PostgreSQL ni Redis:
```bash
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml stop medusa-api
```

Para detener los servicios de staging completos preservando los volúmenes intactos:
```bash
cd ~/mercadal-staging
docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml down
```

### 3.9. Ejecución de Probes de Precios (PRICE) y Seguridad (SEC)
Los probes de validación arquitectónica permiten medir en vivo el aislamiento de precios por customer group y la seguridad de las sesiones de clientes sin exponer secretos:

1. **Variables de entorno para probes**:
   Se configuran en `~/mercadal-staging/staging-test-tokens.env` con permisos `chmod 600`:
   ```bash
   BASE_URL="http://100.124.132.48:9000"
   PK_B2C="<pk_pampa_novus_b2c>"
   PK_B2B="<pk_talabarteria_b2b>"
   TOKEN_B2C="<jwt_bearer_token_cliente_b2c>"
   TOKEN_B2B="<jwt_bearer_token_cliente_b2b>"
   # Opcionales para SEC-02 (si faltan pedidos reales en la DB, SEC-02 reporta BLOCKED / NO EJECUTADO):
   # ORDER_ID_B2C="<order_id_b2c_existente>"
   # ORDER_ID_B2B="<order_id_b2b_existente>"
   ```
   *Nota fail-closed*: Si `PK_*` o `TOKEN_*` faltan, ambos probes abortan inmediatamente con exit code 1 sin recurrir a tokens falsos.

2. **Ejecución del probe de precios (PRICE-01, PRICE-02, PRICE-03, PRICE-LEAK)**:
   ```bash
   cd ~/mercadal-staging
   source staging-test-tokens.env && cd build-context && node tests/price/probe-price.mjs
   ```

3. **Ejecución del probe de seguridad (SEC-01, SEC-02, SEC-03 [NO EJECUTADO], SEC-04)**:
   ```bash
   cd ~/mercadal-staging
   source staging-test-tokens.env && cd build-context && node tests/security/probe-security.mjs
   ```
   *Criterio de auditoría*:
   - `SEC-02`: Exige pedidos reales; si la DB tiene 0 pedidos reporta honestamente `BLOCKED / NO EJECUTADO` para evitar 404s triviales no representativos.
   - `SEC-03`: Registrado formalmente como `NO EJECUTADO` (diferido por decisión de Juan, 2026-10-18) sin ejecutar registros redundantes.

4. **Registro de evidencias**:
   Las salidas se almacenan para auditoría en `~/mercadal-staging/evidence/70-probe-price.log` y `~/mercadal-staging/evidence/80-probe-security.log`.

---

## 4. Diagnóstico y Resolución de Problemas

### Qué hacer si el contenedor queda en estado `unhealthy`
1. **Inspeccionar registros de error**:
   ```bash
   docker logs --tail 100 mercadal-staging-medusa
   ```
2. **Revisar conectividad con PostgreSQL y Redis**:
   ```bash
   docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml exec mercadal-staging-postgres pg_isready -U mercadal_user -d mercadal_staging_db
   docker compose -p mercadal-staging --env-file .env.staging -f docker-compose.staging.yml exec mercadal-staging-redis redis-cli ping
   ```
3. **Verificar tiempo de inicio (`start_period`)**:
   Medusa 2 compila y carga módulos en el arranque. Si el healthcheck reporta fallos iniciales antes de los 60s, esperar a que venza el `start_period`.
4. **Verificar permisos y variables de entorno**:
   Confirmar que `~/.env.medusa.staging` tenga permisos `600` y contenga todas las variables requeridas por `medusa-config.ts`.
