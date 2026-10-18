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
curl -s -H "Authorization: Bearer $TOKEN" "http://100.124.132.48:9000/admin/products?limit=100&fields=id,title,handle,*variants" | jq '{count: .count, products: [.products[] | {id: .id, title: .title, handle: .handle, variants: [.variants[] | {sku: .sku, manage_inventory: .manage_inventory}]}]}'

echo ""
echo "============================================================"
echo "6. GET /admin/inventory-items?limit=100 (niveles de stock)"
echo "============================================================"
curl -s -H "Authorization: Bearer $TOKEN" "http://100.124.132.48:9000/admin/inventory-items?limit=100&fields=id,sku,*location_levels" | jq '{count: .count, inventory_items: [.inventory_items[] | {sku: .sku, location_levels: [.location_levels[] | {location_id: .location_id, stocked_quantity: .stocked_quantity}]}]}'
