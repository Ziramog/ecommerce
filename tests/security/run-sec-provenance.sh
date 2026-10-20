#!/usr/bin/env bash
set -e

export IMAGE_TAG=$(docker inspect --format '{{.Config.Image}}' mercadal-staging-medusa)
export IMAGE_REVISION_LABEL=$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' mercadal-staging-medusa)
export IMAGE_DIGEST=$(docker inspect --format '{{.Image}}' mercadal-staging-medusa)
export REPO_HEAD="${REPO_HEAD:-89fe3a95ca9fb913c33d444bee45a6e9c7c07626}"
export PROBE_BLOB="${PROBE_BLOB:-git:5f8affc6e146cf91ee70378afb0037fe0e345fcf}"

# Cargar variables de staging y fixtures de pedidos reales de M360-012 con export automático
set -a
if [ -f ~/mercadal-staging/staging-test-tokens.env ]; then
  source ~/mercadal-staging/staging-test-tokens.env
fi
if [ -f ~/mercadal-staging/evidence/sec02-fixtures.env ]; then
  source ~/mercadal-staging/evidence/sec02-fixtures.env
fi
set +a

cd ~/mercadal-staging/build-context

echo "=== EJECUTANDO SEC PROBE CON SEC-02 DESBLOQUEADO ==="
node tests/security/probe-security.mjs 2>&1 | tee ~/mercadal-staging/evidence/81-probe-security-provenance.log
