# Spike Técnico 02: Logística y Envíos Nacionales (Medusa 2 Fulfillment)

## 1. Contexto & Objetivos
El objetivo de este spike es diseñar la arquitectura del módulo de envíos en **Medusa 2.21.2** adaptada a la geografía y logística argentina, cubriendo tanto la paquetería minorista B2C (**Pampa Novus**) como los envíos pesados y bultos mayoristas B2B (**Talabartería Mercadal**).

---

## 2. Arquitectura de Proveedores en Medusa 2 (`AbstractFulfillmentProviderService`)

Medusa 2 desacopla la logística mediante el módulo `@medusajs/fulfillment` y la clase base `AbstractFulfillmentProviderService`:

```typescript
import {
  AbstractFulfillmentProviderService,
  FulfillmentOption,
  CalculatedShippingOptionPrice,
} from '@medusajs/framework/utils'

export class ArgentinaLogisticsProviderService extends AbstractFulfillmentProviderService {
  static identifier = 'argentina-logistics'

  // Opciones de envío expuestas en Checkout
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      { id: 'andreani_estandar_domicilio', name: 'Andreani — Envío a Domicilio Nacional' },
      { id: 'andreani_sucursal', name: 'Andreani — Retiro en Sucursal' },
      { id: 'correo_argentino_paqar', name: 'Correo Argentino — Paq.Ar Clásico' },
      { id: 'expreso_interior_b2b', name: 'Expreso al Interior (Flete Pago en Destino B2B)' },
      { id: 'retiro_deposito_caba', name: 'Retiro en Depósito Central CABA (Gratuito)' },
    ]
  }

  // Validador de código postal argentino (4 dígitos numéricos o formato CPA de 8 caracteres)
  async canCalculate(data: any): Promise<boolean> {
    const cp = data?.postal_code || data?.shipping_address?.postal_code
    if (!cp) return false
    return /^\d{4}$/.test(cp) || /^[A-Z]\d{4}[A-Z]{3}$/.test(cp)
  }

  // Cálculo dinámico de flete por peso volumétrico y zona
  async calculatePrice(
    optionData: any,
    data: any,
    cart: any
  ): Promise<CalculatedShippingOptionPrice> {
    const postalCode = data?.shipping_address?.postal_code || '1000'
    const totalWeight = calculateCartBillableWeight(cart.items)

    if (optionData.id === 'retiro_deposito_caba') {
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: true }
    }

    if (optionData.id === 'expreso_interior_b2b') {
      // Costo de embalaje y traslado a terminal de Villa Soldati
      return { calculated_amount: 8500, is_calculated_price_tax_inclusive: true }
    }

    // Cotización contra tabla zonal / API de Andreani
    const rate = resolvePostalZoneRate(postalCode, totalWeight, optionData.id)
    return {
      calculated_amount: rate,
      is_calculated_price_tax_inclusive: true,
    }
  }

  // Generación de Guía / Tracking Number
  async createFulfillment(data: any, items: any, order: any, fulfillment: any): Promise<any> {
    const trackingNumber = `AND-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    return {
      data: {
        tracking_number: trackingNumber,
        carrier: 'Andreani Logística',
        label_url: `https://tracking.mercadal.com.ar/labels/${trackingNumber}.pdf`,
      },
    }
  }

  async cancelFulfillment(fulfillment: any): Promise<any> {
    return { status: 'cancelled' }
  }
}
```

---

## 3. Modelo de Peso Volumétrico para Talabartería

En artículos ecuestres (monturas, bastos, aperos), el volumen de la encomienda suele superar el peso en báscula.

### Fórmula Estándar IATA / Andreani:
$$\text{Peso Volumétrico (kg)} = \frac{\text{Largo (cm)} \times \text{Ancho (cm)} \times \text{Alto (cm)}}{5000}$$

$$\text{Peso Facturable} = \max(\text{Peso Real}, \text{Peso Volumétrico})$$

### Ejemplo para Montura Criolla de Trabajo (`SKU-CRI-001`):
- Peso Real: 7.5 kg
- Dimensiones Embalaje: 65 cm x 45 cm x 40 cm = 117.000 cm³
- Peso Volumétrico: $117.000 / 5000 = 23.4\text{ kg}$
- **Peso Facturable**: **23.4 kg** (Zona tarifa bulto mediano/pesado).

---

## 4. Matriz de Cobertura Zonal en Argentina

| Zona | Alcance Territorial | Plazo Promedio | Tarifas Base Estimadas |
|---|---|---|---|
| **AMBA** | CABA y Gran Buenos Aires | 24 - 48 hs | $4.500 - $8.000 ARS |
| **Provincial** | Resto de Bs. As., Santa Fe, Córdoba, Entre Ríos | 48 - 72 hs | $7.500 - $14.000 ARS |
| **Interior / Patagonia** | NOA, Cuyo, NEA, Patagonia | 72 - 120 hs | $12.000 - $26.000 ARS |
| **Expresos B2B** | Despacho consolidado a expreso del cliente | 24 hs a terminal | $8.500 ARS fijo (traslado y embalaje) |

---

## 5. Próximos Pasos de Implementación
1. Implementar `modules/argentina-logistics` en el backend.
2. Integrar cálculo dinámico en el selector de envíos de `apps/pampa-novus` (`/carrito`).
3. Registrar eventos de despacho con actualización automática de estado en Medusa (`order.fulfillment_created`).
