#!/usr/bin/env bash
# ==============================================================================
# MERCADAL DIGITAL 360 — Script de Backup Seguro de Base de Datos de Staging
# Ubicación en VPS: /home/hermes/mercadal-staging/backup-staging.sh
# Permisos: chmod 700 backup-staging.sh
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${HOME}/mercadal-staging/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mercadal_staging_db_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="mercadal-staging-postgres"
DB_USER="mercadal_staging_user"
DB_NAME="mercadal_staging_db"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

echo "[INFO] [$(date)] Iniciando backup de base de datos de Staging (${DB_NAME})..."

# Verificar que el contenedor de PostgreSQL de Staging esté en ejecución
if ! docker ps --filter "name=^/${CONTAINER_NAME}$" --filter "status=running" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[ERROR] El contenedor ${CONTAINER_NAME} no está en ejecución. Abortando backup." >&2
  exit 1
fi

# Ejecutar pg_dump dentro del contenedor y comprimir en streaming
docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges \
  | gzip -9 > "${BACKUP_FILE}"

# Validar integridad del archivo generado
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "[ERROR] El archivo de backup generado está vacío o no se creó correctamente." >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[OK] [$(date)] Backup completado con éxito: ${BACKUP_FILE} (Tamaño: ${FILE_SIZE})"

# Rotación de backups: conservar últimos 7 días
echo "[INFO] Rotando backups antiguos (> 7 días)..."
find "${BACKUP_DIR}" -name "mercadal_staging_db_*.sql.gz" -mtime +7 -type f -delete
echo "[OK] Rotación finalizada."
