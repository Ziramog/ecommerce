#!/usr/bin/env bash
# ==============================================================================
# MERCADAL DIGITAL 360 — Script de Restauración Controlada de Staging
# Ubicación en VPS: /home/hermes/mercadal-staging/restore-staging.sh
# Permisos: chmod 700 restore-staging.sh
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <ruta_al_archivo_backup.sql.gz>"
  echo "Ejemplo: $0 ~/mercadal-staging/backups/mercadal_staging_db_20261023_180000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="mercadal-staging-postgres"
DB_USER="mercadal_staging_user"
DB_NAME="mercadal_staging_db"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] El archivo de backup no existe: ${BACKUP_FILE}" >&2
  exit 1
fi

echo "=============================================================================="
echo " ADVERTENCIA CRÍTICA: RESTAURACIÓN DE BASE DE DATOS DE STAGING"
echo " Contenedor destino : ${CONTAINER_NAME}"
echo " Base de datos       : ${DB_NAME}"
echo " Archivo de origen   : ${BACKUP_FILE}"
echo "=============================================================================="
echo "Esta operación sobreescribirá la totalidad de los datos en ${DB_NAME}."
read -r -p "Para confirmar, escriba exactamente '${DB_NAME}': " CONFIRMATION

if [ "${CONFIRMATION}" != "${DB_NAME}" ]; then
  echo "[CANCELADO] Confirmación no coincide. Operación abortada sin cambios."
  exit 1
fi

echo "[INFO] Verificando estado del contenedor..."
if ! docker ps --filter "name=^/${CONTAINER_NAME}$" --filter "status=running" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[ERROR] El contenedor ${CONTAINER_NAME} no está en ejecución. Inícielo antes de restaurar." >&2
  exit 1
fi

echo "[INFO] Restaurando datos..."
gzip -dc "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" --quiet

echo "[OK] Restauración completada exitosamente desde ${BACKUP_FILE}."
