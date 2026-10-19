#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Reporte de Estado de Inventario de los 10 SKUs
 */

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('[ERROR] Variable ADMIN_TOKEN es requerida.')
  process.exit(1)
}

async function run() {
  const res = await fetch(`${BASE_URL}/admin/inventory-items?limit=100&fields=*location_levels`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  const data = await res.json()
  const summary = (data.inventory_items || [])
    .map((i) => ({
      sku: i.sku,
      title: i.title,
      stocked: Number(i.location_levels?.[0]?.stocked_quantity ?? 0),
      reserved: Number(i.location_levels?.[0]?.reserved_quantity ?? 0),
      available: Number(i.location_levels?.[0]?.available_quantity ?? 0),
    }))
    .sort((a, b) => a.sku.localeCompare(b.sku))

  console.log('======================================================================')
  console.log('ESTADO DE INVENTARIO FINAL EN STAGING (10 SKUS)')
  console.log('======================================================================')
  console.table(summary)
}

run().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
