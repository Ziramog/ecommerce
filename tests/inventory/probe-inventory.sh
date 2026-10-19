#!/usr/bin/env bash
# =============================================================================
# Mercadal Digital 360 — Runner de Probes de Inventario (INV-01..04)
# =============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cargar variables de entorno desde el path estándar de Staging si existen
if [ -f "$HOME/mercadal-staging/staging-test-tokens.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$HOME/mercadal-staging/staging-test-tokens.env"
  set +a
fi

if [ -f "$HOME/mercadal-staging/get-admin-token.sh" ] && [ -z "$ADMIN_TOKEN" ]; then
  ADMIN_TOKEN="$("$HOME/mercadal-staging/get-admin-token.sh")"
  export ADMIN_TOKEN
fi

# Validar variables requeridas
REQUIRED_VARS=(BASE_URL PK_B2C PK_B2B TOKEN_B2C TOKEN_B2B ADMIN_TOKEN)
MISSING=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "[ERROR] Variables de entorno faltantes: ${MISSING[*]}"
  echo "Asegúrese de definir o cargar las variables requeridas antes de ejecutar este runner."
  exit 1
fi

TARGET="$1"

if [ -n "$TARGET" ]; then
  if [ -f "$DIR/$TARGET" ]; then
    echo "======================================================================"
    echo "Ejecutando probe individual: $TARGET"
    echo "======================================================================"
    node "$DIR/$TARGET"
  elif [ -f "$TARGET" ]; then
    echo "======================================================================"
    echo "Ejecutando probe individual: $TARGET"
    echo "======================================================================"
    node "$TARGET"
  else
    echo "[ERROR] No se encontró el archivo: $TARGET"
    exit 1
  fi
else
  echo "======================================================================"
  echo "Ejecutando Suite Completa de Inventario (INV-01..04)"
  echo "Target: $BASE_URL"
  echo "======================================================================"

  PROBES=(
    "probe-inv-01-concurrency.mjs"
    "probe-inv-02-idempotency.mjs"
    "probe-inv-03-lifecycle.mjs"
    "probe-inv-04-cache.mjs"
  )

  for P in "${PROBES[@]}"; do
    if [ -f "$DIR/$P" ]; then
      echo ""
      echo ">>> Corriendo $P..."
      node "$DIR/$P"
    fi
  done

  echo ""
  echo "======================================================================"
  echo "Suite Completa de Inventario finalizada exitosamente."
  echo "======================================================================"
fi
