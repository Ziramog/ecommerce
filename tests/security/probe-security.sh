#!/usr/bin/env bash
# Mercadal Digital 360 — Runner Bash para Probes de Seguridad (SEC-01, 02, 03, 04)
# Lee variables de entorno del llamador sin exponer secretos.

set -e

if [ -z "$PK_B2C" ] || [ -z "$PK_B2B" ]; then
  echo "Error: Se requieren variables de entorno PK_B2C y PK_B2B."
  echo "Ejemplo: PK_B2C=... PK_B2B=... TOKEN_B2C=... TOKEN_B2B=... bash tests/security/probe-security.sh"
  exit 1
fi

node tests/security/probe-security.mjs
