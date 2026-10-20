# Runbook de Despliegue y Operaciones en Producción (`mercadal-prod`)

## 1. Principios Mandatorios de Operación
- **Protección de Servicios Existentes**: WOLFIM, Hermes, Tailscale y Staging deben permanecer 100% operativos, sin reinicio del daemon de Docker ni colisión de puertos.
- **Aislamiento Estricto de Namespace**: Todos los contenedores, redes y volúmenes de producción llevan el prefijo `mercadal-prod-*` y residen en el proyecto Docker `mercadal-prod`.
- **Límites de Recursos (*Hard Limits*)**: Cada servicio cuenta con cuotas estrictas de CPU y límites de memoria (RAM total combinada de producción < 3.2 GB).
- **Cero Secretos en Git**: Las contraseñas, tokens JWT y claves privadas se generan *in situ* en el VPS en `/home/hermes/mercadal-prod/.env.production` con permisos `chmod 600`.
- **Aprobación Previa Obligatoria**: Ningún paso de este runbook se ejecuta en el VPS sin la autorización explícita del usuario.

---

## 2. Parámetros del Entorno de Producción

| Parámetro | Valor de Producción | Notas |
|---|---|---|
| **Directorio en VPS** | `/home/hermes/mercadal-prod/` | Permisos `chmod 700` |
| **Project Name Docker** | `mercadal-prod` | `--project-name mercadal-prod` |
| **Red Docker** | `mercadal_prod_net` | Bridge privado aislado |
| **Base de Datos** | `mercadal_prod_db` | Puerto interno 5432 (no publicado al host) |
| **Redis** | `mercadal_prod_redis` | Puerto interno 6379 (no publicado al host) |
| **Medusa Backend** | `mercadal-prod-medusa` | Loopback `127.0.0.1:9001:9000` (sin colisión con staging 9000) |
| **Pampa Novus (B2C)** | `mercadal-prod-pampa-novus` | Interno `3000` -> Proxy Caddy |
| **Talabartería (B2B)** | `mercadal-prod-talabarteria-b2b` | Interno `3001` -> Proxy Caddy |
| **Reverse Proxy (Caddy)**| `mercadal-prod-caddy` | Puertos `80:80`, `443:443` (SSL automático Let's Encrypt) |

---

## 3. Procedimiento de Despliegue Inicial (Paso a Paso)

### Paso 1: Pre-flight Check en VPS (Auditoría de Puertos y Memoria)
```bash
# 1.1 Verificar puertos requeridos libres en el host (80, 443, 9001)
ss -tulpn | grep -E ':(80|443|9001)\b'
# (Debe retornar vacío. Si el puerto 80 o 443 estuviera ocupado por otro servicio, detenerse e informar)

# 1.2 Verificar memoria disponible
free -h
# (Se requiere al menos 3.5 GB de RAM disponible)

# 1.3 Verificar integridad de WOLFIM y Hermes
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Paso 2: Creación de Directorio Aislado y Secretos
```bash
# 2.1 Crear directorio
mkdir -p ~/mercadal-prod
chmod 700 ~/mercadal-prod
cd ~/mercadal-prod

# 2.2 Copiar docker-compose.prod.yml y Caddyfile desde el repositorio
# 2.3 Generar .env.production seguro in situ:
cat << 'EOF' > .env.production
NODE_ENV=production
POSTGRES_DB=mercadal_prod_db
POSTGRES_USER=mercadal_prod_user
EOF

# Generar contraseñas criptográficas seguras:
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)" >> .env.production
echo "REDIS_PASSWORD=$(openssl rand -hex 24)" >> .env.production
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env.production
echo "COOKIE_SECRET=$(openssl rand -hex 32)" >> .env.production

# Configurar permisos estrictos
chmod 600 .env.production
```

### Paso 3: Inicialización de Persistencia (PostgreSQL & Redis)
```bash
cd ~/mercadal-prod
docker compose -p mercadal-prod --env-file .env.production -f docker-compose.prod.yml up -d postgres redis

# Verificar salud de los servicios
docker compose -p mercadal-prod ps
```

### Paso 4: Migraciones de Base de Datos
```bash
# Ejecutar migraciones iniciales de Medusa 2
docker run --rm \
  --network mercadal_prod_net \
  --env-file ~/mercadal-prod/.env.production \
  mercadal-prod-medusa:latest \
  npx medusa db:migrate
```

### Paso 5: Despliegue de la Aplicación y Reverse Proxy
```bash
cd ~/mercadal-prod
docker compose -p mercadal-prod --env-file .env.production -f docker-compose.prod.yml up -d medusa-api pampa-novus talabarteria-b2b caddy
```

---

## 4. Verificación y Smoke Tests Post-Despliegue

```bash
# 1. Healthcheck del Backend
curl -I https://api.mercadal.com.ar/health
# Esperado: HTTP/2 200 OK

# 2. Storefront B2C (Pampa Novus)
curl -I https://pampanovus.com.ar/
# Esperado: HTTP/2 200 OK

# 3. Storefront B2B (Talabartería Mercadal)
curl -I https://mayorista.talabarteriamercadal.com.ar/
# Esperado: HTTP/2 200 OK

# 4. Verificación de Certificados SSL
echo | openssl s_client -connect pampanovus.com.ar:443 -servername pampanovus.com.ar 2>/dev/null | openssl x509 -noout -dates
```

---

## 5. Estrategia de Backup y Plan de Contingencia (Rollback)

### Backup Diario Automatizado de PostgreSQL:
```bash
# Script cron diario (a ejecutar a las 03:00 AM ART):
docker exec mercadal-prod-postgres pg_dump -U mercadal_prod_user mercadal_prod_db | gzip > ~/mercadal-prod/backups/db_$(date +%Y%m%d_%H%M%S).sql.gz
find ~/mercadal-prod/backups/ -name "db_*.sql.gz" -mtime +14 -delete
```

### Procedimiento de Rollback Inmediato:
En caso de detectar una anomalía crítica tras actualizar una imagen:
```bash
# 1. Detener el contenedor afectado
docker compose -p mercadal-prod stop medusa-api

# 2. Revertir a la versión tag anterior en .env.production (ej: MEDUSA_IMAGE_TAG=2.21.2-previous)
sed -i 's/MEDUSA_IMAGE_TAG=.*/MEDUSA_IMAGE_TAG=2.21.2-previous/' .env.production

# 3. Reiniciar el servicio
docker compose -p mercadal-prod up -d medusa-api
```
