#!/usr/bin/env bash
# Mercadal Digital 360 — Runner Bash para Probes de Precio (PRICE-01, 02, 03)
# Lee variables de entorno del llamador sin exponer secretos.

set -e

if [ -z "$PK_B2C" ] || [ -z "$PK_B2B" ]; then
  echo "Error: Se requieren variables de entorno PK_B2C y PK_B2B."
  echo "Ejemplo: PK_B2C=... PK_B2B=... TOKEN_B2B=... bash tests/price/probe-price.sh"
  exit 1
fi

node tests/price/probe-price.mjs
