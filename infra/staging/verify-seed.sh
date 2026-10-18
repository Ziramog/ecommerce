#!/usr/bin/env bash
set -e

# Leer credencial de admin de staging sin imprimirla
MEDUSA_ADMIN_PASSWORD=$(grep "^MEDUSA_ADMIN_STAGING_PASSWORD=" ~/mercadal-staging/.env.medusa.staging | cut -d"=" -f2- | tr -d "\"'\r\n")

TOKEN=$(curl -s -X POST http://100.124.132.48:9000/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@mercadal-staging.internal\",\"password\":\"$MEDUSA_ADMIN_PASSWORD\"}" | jq -r .token)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Error: no se pudo obtener token de autenticacion admin"
  exit 1
fi

echo "============================================================"
echo "1. GET /admin/sales-channels"
echo "============================================================"
curl -s -H "Authorization: Bearer $TOKEN" http://100.124.132.48:9000/admin/sales-channels | jq '{count: .count, sales_channels: [.sales_channels[] | {id: .id, name: .name, is_disabled: .is_disabled}]}'

echo ""
echo "============================================================"
echo "2. GET /admin/api-keys?type=publishable"
echo "============================================================"
curl -s -H "Authorization: Bearer $TOKEN" "http://100.124.132.48:9000/admin/api-keys?type=publishable" | jq '{count: .count, api_keys: [.api_keys[] | {id: .id, title: .title, type: .type, sales_channels: [.sales_channels[]? | {id: .id, name: .name}]}]}'

echo ""
echo "============================================================"
echo "3. GET /admin/stock-locations"
echo "============================================================"
LOC_RES=$(curl -s -H "Authorization: Bearer $TOKEN" http://100.124.132.48:9000/admin/stock-locations)
echo "$LOC_RES" | jq '{count: .count, stock_locations: [.stock_locations[] | {id: .id, name: .name}]}'
LOC_ID=$(echo "$LOC_RES" | jq -r '.stock_locations[0].id')

echo ""
echo "============================================================"
echo "4. GET /admin/stock-locations/$LOC_ID (canales vinculados)"
echo "============================================================"
curl -s -H "Authorization: Bearer $TOKEN" "http://100.124.132.48:9000/admin/stock-locations/$LOC_ID?fields=*sales_channels" | jq '{id: .stock_location.id, name: .stock_location.name, sales_channels: [.stock_location.sales_channels[] | {id: .id, name: .name}]}'

echo ""
echo "============================================================"
echo "5. GET /admin/products?limit=100 (conteo y SKU)"
echo "============================================================"
PROD_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "http://100.124.132.48:9000/admin/products?limit=100&fields=id,title,handle,*variants")
echo "$PROD_RES" | jq '{count: .count, products: [.products[] | {id: .id, title: .title, handle: .handle, variants: [.variants[] | {sku: .sku, manage_inventory: .manage_inventory}]}]}'

PRODUCT_TOTAL=$(echo "$PROD_RES" | jq -r '.count')
SEED_PRODUCT_COUNT=$(echo "$PROD_RES" | jq -r '[.products[] | select(.handle as $h | ["montura-criolla-de-trabajo","bozal-cuero-crudo-trenzado","cinturon-carpincho-alpaca","rollo-lonja-vacuna-pack-x10","estribos-chaquenos-acero-inoxidable","cinchon-lona-reforzado-cuero-suela","freno-criollo-cabeza-de-moro","manta-sudadero-lana-pura","cuchillo-criollo-vaina-repujada","grasa-de-potro-cuero-500g"] | index($h))] | length')
NULL_HANDLES_COUNT=$(echo "$PROD_RES" | jq -r '[.products[] | select(.handle == null or .handle == "")] | length')

echo "------------------------------------------------------------"
echo "VERIFICACION ABSOLUTA DE CATALOGO (API):"
echo "  - productTotal absoluto: $PRODUCT_TOTAL (Esperado: 10)"
echo "  - seedProductCount:      $SEED_PRODUCT_COUNT (Esperado: 10)"
echo "  - nullHandlesCount:      $NULL_HANDLES_COUNT (Esperado: 0)"
echo "------------------------------------------------------------"

if [ "$PRODUCT_TOTAL" -ne 10 ] || [ "$SEED_PRODUCT_COUNT" -ne 10 ] || [ "$NULL_HANDLES_COUNT" -ne 0 ]; then
  echo "ERROR: Discrepancia en conteos absolutos de catalogo API. Abortando."
  exit 1
fi

echo ""
echo "============================================================"
echo "6. GET /admin/inventory-items?limit=100 (niveles de stock)"
echo "============================================================"
curl -s -H "Authorization: Bearer $TOKEN" "http://100.124.132.48:9000/admin/inventory-items?limit=100&fields=id,sku,*location_levels" | jq '{count: .count, inventory_items: [.inventory_items[] | {sku: .sku, location_levels: [.location_levels[] | {location_id: .location_id, stocked_quantity: .stocked_quantity}]}]}'

echo ""
echo "============================================================"
echo "7. VERIFICACION DIRECTA SQL (PostgreSQL mercadal_staging_db)"
echo "============================================================"
SQL_TOTAL=$(docker compose -p mercadal-staging --env-file ~/mercadal-staging/.env.staging -f ~/mercadal-staging/docker-compose.staging.yml exec -T mercadal-staging-postgres psql -U mercadal_user -d mercadal_staging_db -t -A -c "SELECT count(id) FROM product WHERE deleted_at IS NULL;")
SQL_NULL=$(docker compose -p mercadal-staging --env-file ~/mercadal-staging/.env.staging -f ~/mercadal-staging/docker-compose.staging.yml exec -T mercadal-staging-postgres psql -U mercadal_user -d mercadal_staging_db -t -A -c "SELECT count(id) FROM product WHERE deleted_at IS NULL AND (handle IS NULL OR handle = '');")
SQL_SEED=$(docker compose -p mercadal-staging --env-file ~/mercadal-staging/.env.staging -f ~/mercadal-staging/docker-compose.staging.yml exec -T mercadal-staging-postgres psql -U mercadal_user -d mercadal_staging_db -t -A -c "SELECT count(id) FROM product WHERE deleted_at IS NULL AND handle IN ('montura-criolla-de-trabajo','bozal-cuero-crudo-trenzado','cinturon-carpincho-alpaca','rollo-lonja-vacuna-pack-x10','estribos-chaquenos-acero-inoxidable','cinchon-lona-reforzado-cuero-suela','freno-criollo-cabeza-de-moro','manta-sudadero-lana-pura','cuchillo-criollo-vaina-repujada','grasa-de-potro-cuero-500g');")

echo "CONTEOS DIRECTOS SQL:"
echo "  - productTotal en Postgres (SQL_TOTAL): $SQL_TOTAL (Esperado: 10)"
echo "  - seedProductCount en Postgres (SQL_SEED): $SQL_SEED (Esperado: 10)"
echo "  - nullHandles en Postgres (SQL_NULL):   $SQL_NULL (Esperado: 0)"

if [ "$SQL_TOTAL" -ne 10 ] || [ "$SQL_SEED" -ne 10 ] || [ "$SQL_NULL" -ne 0 ]; then
  echo "ERROR: Discrepancia en conteos absolutos SQL de PostgreSQL. Abortando."
  exit 1
fi
echo "TODO CORRECTO: Conteos absolutos validados en API y PostgreSQL (10/10/0)."
