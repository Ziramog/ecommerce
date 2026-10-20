#!/usr/bin/env bash
set -e

export IMAGE_TAG=$(docker inspect --format '{{.Config.Image}}' mercadal-staging-medusa)
export IMAGE_REVISION_LABEL=$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' mercadal-staging-medusa)
export IMAGE_DIGEST=$(docker inspect --format '{{.Image}}' mercadal-staging-medusa)
export REPO_HEAD="bf12481791996f98b958665bd5e0e0e80d15d056"

set -a
source ~/mercadal-staging/staging-test-tokens.env
if [ -f ~/mercadal-staging/evidence/sec02-fixtures.env ]; then
  source ~/mercadal-staging/evidence/sec02-fixtures.env
fi
set +a

cd ~/mercadal-staging/build-context

echo "=== EJECUTANDO PRICE PROBE (PROVENANCE) ==="
export PROBE_BLOB="git:f4865caea6429b881f764f178c0f7b848432c1cc"
node tests/price/probe-price.mjs > ~/mercadal-staging/evidence/71-probe-price-provenance.log 2>&1 || true
cat ~/mercadal-staging/evidence/71-probe-price-provenance.log

echo ""
echo "=== EJECUTANDO SEC PROBE (PROVENANCE) ==="
export PROBE_BLOB="git:5f8affc6e146cf91ee70378afb0037fe0e345fcf"
node tests/security/probe-security.mjs > ~/mercadal-staging/evidence/81-probe-security-provenance.log 2>&1 || true
cat ~/mercadal-staging/evidence/81-probe-security-provenance.log
