# Spike Técnico 01: Integración con Mercado Pago Argentina (Medusa 2)

## 1. Contexto & Objetivos
El objetivo de este spike es evaluar la viabilidad técnica, arquitectura de integración, requisitos de seguridad y contratos de prueba para integrar **Mercado Pago Argentina** en el backend unificado de **Medusa 2.21.2** y el storefront B2C **Pampa Novus**.

---

## 2. Análisis del Ecosistema de Plugins: Medusa 1 vs Medusa 2

### 2.1 Diagnóstico de Plugins Comunitarios Existentes
- El paquete comunitario más referenciado históricamente (`@nicogorga/medusa-payment-mercadopago`) fue desarrollado para la arquitectura legacy de **Medusa 1.x** (`medusa-interfaces` y `PaymentService` monolítico).
- **Incompatibilidad Estructural en Medusa 2**:
  Medusa 2.x reemplazó por completo la capa de pagos mediante el módulo independiente `@medusajs/payment` y la clase base `AbstractPaymentProvider` provista por `@medusajs/framework/utils`.
- **Conclusión y Decisión**:
  **No es viable** emplear el paquete v1 sin reescribirlo. Se debe adoptar un **módulo proveedor a medida** (`modules/mercadopago-payment`) compatible nativamente con los workflows y contratos de Medusa 2.

---

## 3. Arquitectura del Proveedor en Medusa 2 (`AbstractPaymentProvider`)

El módulo `mercadopago-payment-provider` implementa la interfaz requerida por el core de Medusa 2:

```typescript
import {
  AbstractPaymentProvider,
  PaymentProviderSessionResponse,
  PaymentProviderError,
  WebhookAction,
  WebhookActionResult,
} from '@medusajs/framework/utils'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

export class MercadoPagoPaymentProviderService extends AbstractPaymentProvider {
  static identifier = 'mercadopago'

  private client: MercadoPagoConfig
  private preference: Preference
  private payment: Payment
  private webhookSecret: string

  constructor(container: any, options: any) {
    super(container, options)
    this.client = new MercadoPagoConfig({
      accessToken: options.accessToken,
      options: { timeout: 10000 },
    })
    this.preference = new Preference(this.client)
    this.payment = new Payment(this.client)
    this.webhookSecret = options.webhookSecret
  }

  // 1. Iniciar Sesión de Pago (Crea Preference para Checkout Pro o Intent para Bricks)
  async initiatePayment(context: any): Promise<PaymentProviderSessionResponse> {
    const { amount, currency_code, resource_id, context: cartContext } = context

    const pref = await this.preference.create({
      body: {
        items: [
          {
            id: resource_id,
            title: `Pedido Mercadal #${resource_id}`,
            unit_price: amount,
            quantity: 1,
            currency_id: currency_code.toUpperCase(), // ARS
          },
        ],
        external_reference: resource_id,
        statement_descriptor: 'PAMPA NOVUS',
        back_urls: {
          success: `${process.env.STORE_URL}/carrito/confirmacion?status=approved`,
          pending: `${process.env.STORE_URL}/carrito/confirmacion?status=pending`,
          failure: `${process.env.STORE_URL}/carrito/confirmacion?status=failure`,
        },
        auto_return: 'approved',
      },
    })

    return {
      data: {
        preference_id: pref.id,
        init_point: pref.init_point,
        sandbox_init_point: pref.sandbox_init_point,
      },
    }
  }

  // 2. Autorizar Pago
  async authorizePayment(paymentSessionData: any, context: any): Promise<any> {
    const paymentId = paymentSessionData.payment_id
    if (!paymentId) {
      return { status: 'requires_more', data: paymentSessionData }
    }

    const mpPayment = await this.payment.get({ id: paymentId })
    if (mpPayment.status === 'approved') {
      return { status: 'authorized', data: mpPayment }
    }
    return { status: 'error', data: mpPayment }
  }

  // 3. Reembolsos
  async refundPayment(paymentData: any, refundAmount: number): Promise<any> {
    const paymentId = paymentData.id
    const refund = await this.payment.refund({
      id: paymentId,
      body: { amount: refundAmount },
    })
    return { data: refund }
  }

  // 4. Procesamiento de Webhooks con Firma Criptográfica
  async getWebhookActionAndData(payload: any): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload
    const isValid = verifyMercadoPagoSignature(headers, rawData, this.webhookSecret)

    if (!isValid) {
      return { action: WebhookAction.FAILED }
    }

    if (data.type === 'payment' || data.action === 'payment.updated') {
      const paymentId = data.data?.id || data.id
      const mpPayment = await this.payment.get({ id: paymentId })

      if (mpPayment.status === 'approved') {
        return {
          action: WebhookAction.AUTHORIZED,
          data: {
            session_id: mpPayment.external_reference,
            amount: mpPayment.transaction_amount,
          },
        }
      }
    }

    return { action: WebhookAction.NOT_SUPPORTED }
  }
}
```

---

## 4. Seguridad de Webhooks: Verificación HMAC-SHA256

Mercado Pago envía la cabecera `x-signature` en cada evento webhook:
```
x-signature: ts=1700000000,v1=4f53b8112e...
x-request-id: e90b41c0-0000-0000-0000-000000000000
```

### Algoritmo de Validación:
1. Extraer timestamp `ts` y hash `v1` desde la cabecera `x-signature`.
2. Armar el manifest string estricto:
   `id:[data.id_url_param];request-id:[x-request-id];ts:[ts];`
3. Computar HMAC-SHA256 con el `MP_WEBHOOK_SECRET`.
4. Comparación en tiempo constante (`crypto.timingSafeEqual`) contra `v1`.
5. Validar que la diferencia de tiempo `abs(Date.now() / 1000 - ts)` no supere 300 segundos para prevenir ataques de repetición (*replay attacks*).

---

## 5. Matriz de Medios y Métodos en Argentina

| Medio | Experiencia | Observaciones Técnicas |
|---|---|---|
| **Dinero en Cuenta MP** | Checkout Pro / Bricks | Acreditación inmediata. Menor tasa de rechazo. |
| **Tarjetas Débito / Crédito** | Checkout Pro / Bricks | Cuotas con bancos locales (Ahora 12 / Cuota Simple según promociones activas). |
| **Efectivo (Pago Fácil / Rapipago)** | Checkout Pro | Pago diferido (estado `pending`). Medusa mantiene reserva de stock hasta expiración de ticket. |

---

## 6. Procedimiento Seguro de Homologación en Staging
- **Credenciales Sandbox**: Se configurarán exclusivamente en Staging VPS mediante variables de entorno seguras (`MP_ACCESS_TOKEN_TEST`, `MP_PUBLIC_KEY_TEST`, `MP_WEBHOOK_SECRET_TEST`).
- **Tarjetas de Prueba**: Uso exclusivo de las tarjetas de prueba oficiales provistas por Mercado Pago Developers (sin cargos reales).
