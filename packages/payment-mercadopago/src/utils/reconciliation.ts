/**
 * WOLFIM Commerce Core — Financial Reconciliation & Incident Manager
 *
 * Intercepts and records any financial discrepancy between Mercado Pago
 * and Medusa 2 before committing payment capture or order workflows.
 */
import fs from 'node:fs'
import path from 'node:path'

export type ReconciliationDiscrepancyType =
  | 'AMOUNT_MISMATCH'
  | 'CURRENCY_MISMATCH'
  | 'COLLECTOR_MISMATCH'
  | 'REFERENCE_MISMATCH'
  | 'UNEXPECTED_STATUS'
  | 'POST_CAPTURE_FAILURE'
  | 'ORPHAN_CAPTURED_PAYMENT'

export interface ReconciliationIncident {
  id: string
  discrepancyType: ReconciliationDiscrepancyType
  paymentId: string | number
  externalReference?: string
  expectedAmount?: number
  receivedAmount?: number
  expectedCurrency?: string
  receivedCurrency?: string
  expectedCollectorId?: string | number
  receivedCollectorId?: string | number
  details: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
  resolutionNotes?: string
}

export class ReconciliationManager {
  private incidents: Map<string, ReconciliationIncident> = new Map()
  private readonly auditLogPath?: string

  constructor(auditLogPath?: string) {
    this.auditLogPath = auditLogPath
    this.loadFromDisk()
  }

  private loadFromDisk(): void {
    if (!this.auditLogPath) return
    try {
      if (fs.existsSync(this.auditLogPath)) {
        const raw = fs.readFileSync(this.auditLogPath, 'utf8')
        const data = JSON.parse(raw)
        if (Array.isArray(data)) {
          this.incidents = new Map(data.map((inc) => [inc.id, inc]))
        }
      }
    } catch {
      this.incidents = new Map()
    }
  }

  private flushToDisk(): void {
    if (!this.auditLogPath) return
    try {
      const dir = path.dirname(this.auditLogPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(
        this.auditLogPath,
        JSON.stringify(Array.from(this.incidents.values()), null, 2),
        'utf8'
      )
    } catch (err) {
      console.error('[ReconciliationManager] Error guardando incidente:', err)
    }
  }

  /**
   * Records a financial discrepancy incident for human review
   */
  public recordIncident(
    incidentInput: Omit<ReconciliationIncident, 'id' | 'timestamp' | 'resolved'>
  ): ReconciliationIncident {
    const id = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const incident: ReconciliationIncident = {
      id,
      ...incidentInput,
      timestamp: new Date().toISOString(),
      resolved: false,
    }

    this.incidents.set(id, incident)
    this.flushToDisk()

    console.warn(
      `[FINANCIAL ALERT] Discrepancia de Pago Registrada [${incident.discrepancyType}]: Pago ${incident.paymentId} - ${incident.details}`
    )

    return incident
  }

  /**
   * Registra un cobro efectivamente capturado en pasarela cuyo workflow de orden
   * en Medusa fue interrumpido o falló por causas de red/base de datos.
   */
  public recordOrphanPayment(
    paymentId: string | number,
    amount: number,
    currency: string,
    details: string,
    externalReference?: string
  ): ReconciliationIncident {
    return this.recordIncident({
      discrepancyType: 'ORPHAN_CAPTURED_PAYMENT',
      paymentId,
      receivedAmount: amount,
      receivedCurrency: currency,
      externalReference,
      details: `[ORPHAN PAYMENT RECONCILIATION] Cobro confirmado en Mercado Pago sin orden finalizada en Medusa: ${details}`,
    })
  }

  /**
   * Retrieves all recorded incidents
   */
  public listIncidents(): ReconciliationIncident[] {
    return Array.from(this.incidents.values())
  }

  /**
   * Retrieves an incident by ID
   */
  public getIncident(id: string): ReconciliationIncident | undefined {
    return this.incidents.get(id)
  }

  /**
   * Clears in-memory and disk incidents (testing only)
   */
  public reset(): void {
    this.incidents.clear()
    this.flushToDisk()
  }
}
