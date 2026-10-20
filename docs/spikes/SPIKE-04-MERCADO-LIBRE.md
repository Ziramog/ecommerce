# Spike Técnico 04: Sincronización Bidireccional con Mercado Libre (MeLi)

## 1. Contexto & Objetivos
El objetivo de este spike es diseñar la arquitectura de sincronización bidireccional entre el catálogo e inventario unificado de **Medusa 2.21.2** y las publicaciones de **Mercado Libre Argentina**, evitando la sobreventa (*overselling*) y asegurando la coherencia por SKU.

---

## 2. Topología de Integración y Flujo de Inventario

```mermaid
flowchart TD
    subgraph Medusa 2 Unified Backend
        Stock[Inventario Digital Único: loc_digital_warehouse]
        WorkflowReserva[completeCartWorkflow / reserveQuantity]
        SubscriberStock[Subscriber: inventory-item.updated]
    end

    subgraph Storefronts Directos
        B2C[Pampa Novus B2C]
        B2B[Talabartería Mercadal B2B]
    end

    subgraph Mercado Libre Ecosystem
        MeliAPI[Mercado Libre REST API]
        MeliWebhook[MeLi Webhook: orders_v2 / items]
        MeliBuyer[Comprador en Mercado Libre]
    end

    B2C -->|Descuenta stock| Stock
    B2B -->|Descuenta stock| Stock
    Stock -->|Evento de cambio| SubscriberStock
    SubscriberStock -->|PUT /items/{id} - Actualiza stock en MeLi| MeliAPI
    MeliBuyer -->|Compra en MeLi| MeliAPI
    MeliAPI -->|Notificación Webhook| MeliWebhook
    MeliWebhook -->|POST /store/meli/webhook| WorkflowReserva
    WorkflowReserva -->|Reserva inmediata en Medusa| Stock
```

---

## 3. Prevención de Sobreventa: Patrón de Margen de Seguridad (*Safety Buffer*)

Dado que la latencia entre una compra en MeLi y la recepción del webhook puede oscilar entre 200 ms y 2 segundos, piezas de alta exclusividad (como la *Montura Criolla de Trabajo* con stock = 1) corren riesgo de colisión concurrente si no se aplica una política de resguardo.

### Estrategia de Asignación de Stock Virtual a MeLi:
$$\text{Stock MeLi} = \max(0, \text{Stock Disponible Medusa} - \text{Buffer de Seguridad})$$

- **Buffer por Defecto**: 1 unidad para piezas artesanales de bajo stock ($\le 3$ unidades).
- **Para piezas con stock abundante** (ej: *Cinchón de lona* con 100 unidades):
  - El buffer puede ser 0 o 1, y la sincronización se dispara en tiempo real vía `inventory-item.updated`.
- Si el stock en Medusa baja a 0, la publicación en MeLi se pausa automáticamente (`status: paused`) mediante la API de MeLi.

---

## 4. Mapeo Canónico por SKU

Mercado Libre permite asociar el código interno del vendedor mediante el atributo `seller_custom_field` o `attributes: [{ id: "SELLER_SKU", value_name: "SKU-..." }]`.

### Tabla de Equivalencia Canónica:
| SKU Maestro Medusa | Título en MeLi | Tipo de Publicación | Stock Medusa | Stock MeLi (con Buffer) |
|---|---|---|---|---|
| `SKU-CRI-001` | Montura Criolla De Trabajo Cuero Suela | Clásica / Premium | 1 | 0 (Exclusiva Storefront) |
| `SKU-DUAL-002` | Bozal Cuero Crudo Trenzado 8 Cabos | Clásica | 24 | 23 |
| `SKU-B2C-003` | Cinturón Carpincho Con Pasador Alpaca | Premium | 15 | 14 |
| `SKU-DUAL-006` | Cinchón Lona Reforzado Traba Cuero | Clásica | 99 | 98 |

---

## 5. Arquitectura del Webhook Handler en Medusa 2

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { topic, resource } = req.body

  if (topic === 'orders_v2') {
    const meliOrderId = resource.split('/').pop()
    const meliService = req.scope.resolve('meliService')
    const inventoryService = req.scope.resolve('inventory')

    // 1. Obtener detalles de la orden en MeLi
    const orderDetails = await meliService.getOrder(meliOrderId)

    // 2. Extraer SKU y unidades vendidas
    for (const item of orderDetails.order_items) {
      const sku = item.item.seller_custom_field || item.item.seller_sku
      const quantity = item.quantity

      // 3. Descontar inmediatamente en el almacén digital compartido
      await inventoryService.adjustInventory('loc_digital_warehouse', sku, -quantity)
    }

    return res.status(200).json({ received: true })
  }

  return res.status(200).json({ ignored: true })
}
```

---

## 6. Próximos Pasos para Fase de Producción
1. Crear aplicación de desarrollo en Mercado Libre Developers (Sandbox).
2. Obtener `client_id` y `client_secret` de prueba sin activación de cargos reales.
3. Configurar token de refresco automático cada 6 horas mediante tarea programada en Medusa (`medusa.jobs`).
