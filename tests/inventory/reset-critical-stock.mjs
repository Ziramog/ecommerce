#!/usr/bin/env node
/**
 * Mercadal Digital 360 — Reset Explícito de Stock para SKU-CRI-001
 *
 * Objetivo:
 * Restaurar SKU-CRI-001 al estado base verificado:
 * stocked_quantity: 1, reserved_quantity: 0, available_quantity: 1.
 *
 * IMPORTANTE:
 * Utiliza exclusivamente las APIs oficiales de Medusa Admin (DELETE /admin/reservations
 * y POST /admin/inventory-items/:id/location-levels/:loc_id).
 * NUNCA escribe directamente a la base de datos PostgreSQL.
 *
 * Variables de entorno requeridas:
 * - BASE_URL: URL base del backend Medusa (default: http://100.124.132.48:9000)
 * - ADMIN_TOKEN: Token Bearer de administrador Medusa
 */

const BASE_URL = process.env.BASE_URL || 'http://100.124.132.48:9000'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('[ERROR] Variable ADMIN_TOKEN es requerida.')
  process.exit(1)
}

const SKU = 'SKU-CRI-001'

async function resolveInventoryItem(sku) {
  const res = await fetch(`${BASE_URL}/admin/inventory-items?limit=100`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  const data = await res.json()
  const item = data.inventory_items?.find((ii) => ii.sku === sku)
  if (!item) throw new Error(`No se encontró inventory item para SKU: ${sku}`)
  return item
}

async function getLocationLevel(inventoryItemId) {
  const res = await fetch(
    `${BASE_URL}/admin/inventory-items/${inventoryItemId}?fields=*location_levels`,
    {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    }
  )
  const data = await res.json()
  const level = data.inventory_item?.location_levels?.[0]
  if (!level) throw new Error(`No se encontró location level para inventory item: ${inventoryItemId}`)
  return level
}

async function resetStock() {
  console.log('======================================================================')
  console.log(`RESET EXPLÍCITO DE INVENTARIO: ${SKU}`)
  console.log(`Backend Target: ${BASE_URL}`)
  console.log('======================================================================')

  const invItem = await resolveInventoryItem(SKU)
  const locLevel = await getLocationLevel(invItem.id)

  console.log(`[ESTADO ACTUAL]`)
  console.log(`  SKU: ${SKU} | ID: ${invItem.id}`)
  console.log(`  Stocked: ${locLevel.stocked_quantity} | Reserved: ${locLevel.reserved_quantity} | Available: ${locLevel.available_quantity}`)

  // 1. Liberar reservas existentes sobre SKU-CRI-001
  const resList = await fetch(`${BASE_URL}/admin/reservations?inventory_item_id[]=${invItem.id}&limit=50`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  })
  if (resList.ok) {
    const resData = await resList.json()
    const reservations = resData.reservations || []
    if (reservations.length > 0) {
      console.log(`\nLiberando ${reservations.length} reserva(s) activa(s)...`)
      for (const r of reservations) {
        console.log(`  Eliminando reserva ${r.id} (qty: ${r.quantity})...`)
        const delRes = await fetch(`${BASE_URL}/admin/reservations/${r.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        })
        if (!delRes.ok) {
          console.warn(`  [WARN] No se pudo eliminar reserva ${r.id}: HTTP ${delRes.status}`)
        }
      }
    } else {
      console.log('\nNo hay reservas explícitas en /admin/reservations para este SKU.')
    }
  }

  // 2. Asegurar que stocked_quantity sea exactamente 1
  console.log('\nAsegurando stocked_quantity = 1 vía POST /admin/inventory-items/:id/location-levels/:loc_id...')
  const updateRes = await fetch(
    `${BASE_URL}/admin/inventory-items/${invItem.id}/location-levels/${locLevel.location_id}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ stocked_quantity: 1 }),
    }
  )

  if (!updateRes.ok) {
    const errText = await updateRes.text()
    throw new Error(`Falla al actualizar stocked_quantity (HTTP ${updateRes.status}): ${errText}`)
  }

  // 3. Verificar estado final
  const finalLevel = await getLocationLevel(invItem.id)
  console.log('\n[ESTADO FINAL VERIFICADO]')
  console.log(`  Stocked: ${finalLevel.stocked_quantity}`)
  console.log(`  Reserved: ${finalLevel.reserved_quantity}`)
  console.log(`  Available: ${finalLevel.available_quantity}`)

  const isOk =
    Number(finalLevel.stocked_quantity) === 1 &&
    Number(finalLevel.reserved_quantity) === 0 &&
    Number(finalLevel.available_quantity) === 1

  if (!isOk) {
    console.error(`[ERROR] El estado no coincide con el objetivo (1/0/1).`)
    process.exit(1)
  }

  console.log('\n[ÉXITO] SKU-CRI-001 restaurado exitosamente a 1 unidad disponible.')
}

resetStock().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
