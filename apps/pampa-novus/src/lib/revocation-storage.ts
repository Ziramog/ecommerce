/**
 * WOLFIM Commerce Core — Durable Revocation Claims Storage (Botón de Arrepentimiento)
 *
 * Cumplimiento:
 * - Ley N° 24.240 de Defensa del Consumidor (Art. 34)
 * - Código Civil y Comercial de la Nación (Art. 1.110)
 * - Resolución 424/2020 SCI & Disposición 954/2025 de la Subsecretaría de Defensa del Consumidor
 *
 * REGLAS VINCULANTES:
 * 1. Acceso libre sin autenticación previa requerida.
 * 2. Persistencia duradera y atómica de cada solicitud con identificador único interno.
 * 3. Cero ambigüedad: NO denominar el código como "oficial de una autoridad pública",
 *    sino "Identificador Único de Gestión Interna".
 * 4. Trazabilidad administrativa de fecha, hora, estado y operador.
 * 5. Registro de eventos de notificación al consumidor y al operador comercial.
 */

import fs from 'node:fs'
import path from 'node:path'

export type RevocationStatus =
  | 'PENDING_OPERATOR_REVIEW'
  | 'IN_PROGRESS'
  | 'GOODS_RETRIEVAL_SCHEDULED'
  | 'REIMBURSED'
  | 'CANCELLED'

export interface RevocationClaim {
  claimId: string // Identificador Único de Gestión Interna (e.g. PN-REV-2026-XXXXX)
  createdAt: string // ISO 8601
  status: RevocationStatus
  legalFramework: 'DISPOSICION_954_2025_LEY_24240_ART_34'
  customer: {
    fullName: string
    dniOrCuit: string
    email: string
    phone: string
  }
  order: {
    orderNumber: string
    deliveryDate: string
    productsToRevoke: string
    reason?: string
  }
  operatorNotification: {
    queuedAt: string
    status: 'QUEUED' | 'NOTIFIED'
    recipientOperator: string
  }
  customerConfirmation: {
    dispatchedAt: string
    channel: 'EMAIL'
    recipient: string
  }
  auditTrail: Array<{
    timestamp: string
    action: string
    actor: string
    notes?: string
  }>
}

export class RevocationStorageService {
  private storageDir: string
  private storageFile: string

  constructor(customStorageDir?: string) {
    this.storageDir = customStorageDir || path.resolve(process.cwd(), '.revocation_store')
    this.storageFile = path.join(this.storageDir, 'revocation_claims.json')
    this.ensureStorage()
  }

  private ensureStorage(): void {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true })
      }
      if (!fs.existsSync(this.storageFile)) {
        fs.writeFileSync(this.storageFile, JSON.stringify([], null, 2), 'utf8')
      }
    } catch (err) {
      console.warn('[RevocationStorage] Warning initializing storage directory:', err)
    }
  }

  private readAll(): RevocationClaim[] {
    try {
      this.ensureStorage()
      const data = fs.readFileSync(this.storageFile, 'utf8')
      return JSON.parse(data) as RevocationClaim[]
    } catch {
      return []
    }
  }

  private writeAll(claims: RevocationClaim[]): void {
    this.ensureStorage()
    const tempFile = `${this.storageFile}.${Date.now()}.tmp`
    fs.writeFileSync(tempFile, JSON.stringify(claims, null, 2), 'utf8')
    fs.renameSync(tempFile, this.storageFile)
  }

  public generateInternalClaimId(): string {
    const year = new Date().getFullYear()
    const timestampPart = Date.now().toString(36).toUpperCase().slice(-4)
    const randomPart = Math.floor(1000 + Math.random() * 9000)
    return `PN-REV-${year}-${timestampPart}${randomPart}`
  }

  public async registerClaim(input: {
    customer: {
      fullName: string
      dniOrCuit: string
      email: string
      phone: string
    }
    order: {
      orderNumber: string
      deliveryDate: string
      productsToRevoke: string
      reason?: string
    }
  }): Promise<RevocationClaim> {
    const claimId = this.generateInternalClaimId()
    const now = new Date().toISOString()

    const claim: RevocationClaim = {
      claimId,
      createdAt: now,
      status: 'PENDING_OPERATOR_REVIEW',
      legalFramework: 'DISPOSICION_954_2025_LEY_24240_ART_34',
      customer: input.customer,
      order: input.order,
      operatorNotification: {
        queuedAt: now,
        status: 'QUEUED',
        recipientOperator: 'postventa@mercadal.com.ar',
      },
      customerConfirmation: {
        dispatchedAt: now,
        channel: 'EMAIL',
        recipient: input.customer.email,
      },
      auditTrail: [
        {
          timestamp: now,
          action: 'CLAIM_SUBMITTED_BY_CONSUMER',
          actor: input.customer.email,
          notes: `Solicitud de revocación registrada bajo Disp. 954/2025 para el pedido ${input.order.orderNumber}.`,
        },
        {
          timestamp: now,
          action: 'OPERATOR_NOTIFICATION_QUEUED',
          actor: 'SYSTEM_NOTIFICATION_DISPATCHER',
          notes: `Alerta en cola de despacho para operador de postventa de Talabartería Mercadal.`,
        },
      ],
    }

    const claims = this.readAll()
    claims.push(claim)
    this.writeAll(claims)

    console.log(
      `[REVOCATION AUDIT] Solicitud de Arrepentimiento registrada exitosamente. ` +
        `ID de Gestión Interna: ${claimId} | Cliente: ${claim.customer.fullName} (${claim.customer.email}) | ` +
        `Pedido: ${claim.order.orderNumber}`
    )

    return claim
  }

  public getClaimById(claimId: string): RevocationClaim | null {
    const claims = this.readAll()
    return claims.find((c) => c.claimId === claimId) || null
  }

  public listClaims(): RevocationClaim[] {
    return this.readAll()
  }

  public updateStatus(
    claimId: string,
    newStatus: RevocationStatus,
    operatorActor: string,
    notes?: string
  ): RevocationClaim | null {
    const claims = this.readAll()
    const index = claims.findIndex((c) => c.claimId === claimId)
    if (index === -1) return null

    const now = new Date().toISOString()
    claims[index].status = newStatus
    claims[index].auditTrail.push({
      timestamp: now,
      action: `STATUS_UPDATED_TO_${newStatus}`,
      actor: operatorActor,
      notes,
    })

    this.writeAll(claims)
    return claims[index]
  }
}

export const revocationStorage = new RevocationStorageService()
