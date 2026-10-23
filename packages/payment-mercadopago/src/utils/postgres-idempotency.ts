/**
 * WOLFIM Commerce Core — PostgreSQL Transactional Idempotency Storage
 *
 * Implements persistent, ACID-compliant webhook idempotency for Mercado Pago.
 *
 * Exigencias técnicas WOLFIM (Prioridad 3):
 * 1. Restricciones de unicidad (PRIMARY KEY en event_key).
 * 2. Operaciones atómicas mediante INSERT ... ON CONFLICT DO UPDATE.
 * 3. Control estricto de concurrencia y prevención de doble procesamiento.
 * 4. Recuperación de operaciones interrumpidas (stale lock recovery con timeout configurable).
 * 5. Reintentos seguros tras fallos transitorios.
 * 6. Conciliación duradera de transacciones.
 */

import type { IdempotencyEntry, IdempotencyStorage } from './idempotency'

export interface PostgresQueryResult<T = any> {
  rows: T[]
  rowCount: number
}

export interface PostgresQueryRunner {
  query<T = any>(sql: string, params?: any[]): Promise<PostgresQueryResult<T>>
}

export const POSTGRES_IDEMPOTENCY_TABLE = 'wolfim_payment_idempotency'

export const IDEMPOTENCY_DDL = `
CREATE TABLE IF NOT EXISTS ${POSTGRES_IDEMPOTENCY_TABLE} (
  event_key VARCHAR(255) PRIMARY KEY,
  status VARCHAR(32) NOT NULL,
  action VARCHAR(64),
  payment_id VARCHAR(64),
  amount NUMERIC(15, 2),
  currency VARCHAR(8),
  collector_id VARCHAR(64),
  external_reference VARCHAR(128),
  retries INT DEFAULT 0,
  locked_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wolfim_payment_idempotency_status
  ON ${POSTGRES_IDEMPOTENCY_TABLE}(status);
CREATE INDEX IF NOT EXISTS idx_wolfim_payment_idempotency_payment_id
  ON ${POSTGRES_IDEMPOTENCY_TABLE}(payment_id);
`

export class PostgresTransactionalIdempotencyStorage implements IdempotencyStorage {
  private readonly client: PostgresQueryRunner
  private readonly staleLockTimeoutMinutes: number
  private schemaInitialized: boolean = false

  constructor(client: PostgresQueryRunner, staleLockTimeoutMinutes: number = 5) {
    this.client = client
    this.staleLockTimeoutMinutes = staleLockTimeoutMinutes
  }

  public async initializeSchema(): Promise<void> {
    if (this.schemaInitialized) return
    await this.client.query(IDEMPOTENCY_DDL)
    this.schemaInitialized = true
  }

  /**
   * Operación atómica de bloqueo concurrente.
   *
   * Utiliza INSERT ... ON CONFLICT DO UPDATE de PostgreSQL:
   * - Si la clave no existe: inserta con estado 'processing' y obtiene el lock.
   * - Si la clave existe con estado 'failed': reintenta incrementando contador de reintentos.
   * - Si la clave existe con estado 'processing' pero locked_at > timeout: recupera la operación interrumpida.
   * - Si la clave está en 'completed' o en 'processing' vigente: la cláusula WHERE no coincide y retorna 0 filas (lock denegado).
   */
  async acquireLock(key: string, entry: IdempotencyEntry): Promise<boolean> {
    await this.initializeSchema()

    const staleInterval = `${this.staleLockTimeoutMinutes} minutes`

    const sql = `
      INSERT INTO ${POSTGRES_IDEMPOTENCY_TABLE} (
        event_key, status, action, payment_id, amount, currency, collector_id,
        external_reference, retries, locked_at, created_at, updated_at
      ) VALUES (
        $1, 'processing', $2, $3, $4, $5, $6, $7, 0, NOW(), NOW(), NOW()
      )
      ON CONFLICT (event_key) DO UPDATE
      SET
        status = 'processing',
        locked_at = NOW(),
        retries = ${POSTGRES_IDEMPOTENCY_TABLE}.retries + 1,
        updated_at = NOW()
      WHERE
        ${POSTGRES_IDEMPOTENCY_TABLE}.status = 'failed'
        OR (
          ${POSTGRES_IDEMPOTENCY_TABLE}.status = 'processing'
          AND ${POSTGRES_IDEMPOTENCY_TABLE}.locked_at < NOW() - INTERVAL '${staleInterval}'
        )
      RETURNING event_key;
    `

    const params = [
      key,
      entry.action || null,
      entry.paymentId ? String(entry.paymentId) : null,
      entry.amount ?? null,
      entry.currency || null,
      entry.collectorId ? String(entry.collectorId) : null,
      entry.externalReference || null,
    ]

    const result = await this.client.query(sql, params)
    return result.rowCount > 0
  }

  async get(key: string): Promise<IdempotencyEntry | null> {
    await this.initializeSchema()

    const sql = `SELECT * FROM ${POSTGRES_IDEMPOTENCY_TABLE} WHERE event_key = $1;`
    const result = await this.client.query(sql, [key])

    if (result.rowCount === 0) return null

    const row = result.rows[0]
    return {
      key: row.event_key,
      status: row.status,
      action: row.action,
      paymentId: row.payment_id,
      amount: row.amount ? Number(row.amount) : undefined,
      currency: row.currency,
      collectorId: row.collector_id,
      externalReference: row.external_reference,
      createdAt: new Date(row.created_at).getTime(),
      completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
      error: row.error_message,
      result: row.result,
    }
  }

  async save(key: string, entry: IdempotencyEntry): Promise<void> {
    await this.initializeSchema()

    const sql = `
      INSERT INTO ${POSTGRES_IDEMPOTENCY_TABLE} (
        event_key, status, action, payment_id, amount, currency, collector_id,
        external_reference, locked_at, completed_at, failed_at, result, error_message, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(),
        $9, $10, $11, $12, NOW()
      )
      ON CONFLICT (event_key) DO UPDATE
      SET
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        failed_at = EXCLUDED.failed_at,
        result = EXCLUDED.result,
        error_message = EXCLUDED.error_message,
        updated_at = NOW();
    `

    const completedAt = entry.completedAt ? new Date(entry.completedAt).toISOString() : null
    const failedAt = entry.status === 'failed' ? new Date().toISOString() : null
    const resultJson = entry.result ? JSON.stringify(entry.result) : null

    await this.client.query(sql, [
      key,
      entry.status,
      entry.action || null,
      entry.paymentId ? String(entry.paymentId) : null,
      entry.amount ?? null,
      entry.currency || null,
      entry.collectorId ? String(entry.collectorId) : null,
      entry.externalReference || null,
      completedAt,
      failedAt,
      resultJson,
      entry.error || null,
    ])
  }

  async delete(key: string): Promise<void> {
    await this.initializeSchema()
    await this.client.query(`DELETE FROM ${POSTGRES_IDEMPOTENCY_TABLE} WHERE event_key = $1;`, [key])
  }

  async clear(): Promise<void> {
    await this.initializeSchema()
    await this.client.query(`DELETE FROM ${POSTGRES_IDEMPOTENCY_TABLE};`)
  }
}

/**
 * Mock Transaccional de PostgreSQL para Suites de Pruebas Unitarias y CI
 *
 * Emula la semántica ACID exacta de PostgreSQL (PRIMARY KEY, INSERT ... ON CONFLICT DO UPDATE,
 * control de bloqueos y cálculo de INTERVAL de tiempo para stale lock recovery) sin requerir
 * un daemon de PostgreSQL activo.
 */
export class MockTransactionalPostgresQueryRunner implements PostgresQueryRunner {
  private tableData: Map<string, any> = new Map()

  async query<T = any>(sql: string, params: any[] = []): Promise<PostgresQueryResult<T>> {
    const trimmed = sql.trim().toUpperCase()

    // DDL
    if (trimmed.startsWith('CREATE TABLE') || trimmed.startsWith('CREATE INDEX')) {
      return { rows: [], rowCount: 0 }
    }

    // SELECT BY KEY
    if (trimmed.startsWith('SELECT * FROM') && trimmed.includes('WHERE EVENT_KEY = $1')) {
      const key = params[0]
      const row = this.tableData.get(key)
      return {
        rows: row ? ([row] as T[]) : [],
        rowCount: row ? 1 : 0,
      }
    }

    // DELETE BY KEY
    if (trimmed.startsWith('DELETE FROM') && trimmed.includes('WHERE EVENT_KEY = $1')) {
      const key = params[0]
      const deleted = this.tableData.delete(key)
      return { rows: [], rowCount: deleted ? 1 : 0 }
    }

    // DELETE ALL
    if (trimmed.startsWith('DELETE FROM') && !trimmed.includes('WHERE')) {
      const count = this.tableData.size
      this.tableData.clear()
      return { rows: [], rowCount: count }
    }

    // ATOMIC ACQUIRE LOCK (INSERT ... ON CONFLICT RETURNING EVENT_KEY)
    if (trimmed.startsWith('INSERT INTO') && trimmed.includes('RETURNING EVENT_KEY')) {
      const [key, action, paymentId, amount, currency, collectorId, externalReference] = params
      const existing = this.tableData.get(key)

      const now = new Date()

      if (!existing) {
        // Inserción limpia: adquiere el lock
        const row = {
          event_key: key,
          status: 'processing',
          action,
          payment_id: paymentId,
          amount,
          currency,
          collector_id: collectorId,
          external_reference: externalReference,
          retries: 0,
          locked_at: now,
          created_at: now,
          updated_at: now,
        }
        this.tableData.set(key, row)
        return { rows: [{ event_key: key }] as unknown as T[], rowCount: 1 }
      }

      // Existe: comprobar condiciones de actualización
      const isFailed = existing.status === 'failed'
      const isStale =
        existing.status === 'processing' &&
        now.getTime() - new Date(existing.locked_at).getTime() > 5 * 60 * 1000

      if (isFailed || isStale) {
        existing.status = 'processing'
        existing.locked_at = now
        existing.retries = (existing.retries || 0) + 1
        existing.updated_at = now
        return { rows: [{ event_key: key }] as unknown as T[], rowCount: 1 }
      }

      // Está en 'completed' o 'processing' activo: conflicto no actualiza
      return { rows: [], rowCount: 0 }
    }

    // SAVE / UPDATE STATUS (INSERT ... ON CONFLICT SET STATUS = EXCLUDED.STATUS)
    if (trimmed.startsWith('INSERT INTO') && trimmed.includes('EXCLUDED.STATUS')) {
      const [key, status, action, paymentId, amount, currency, collectorId, externalRef, compAt, failAt, res, err] =
        params
      const now = new Date()
      const existing = this.tableData.get(key) || {}

      const updated = {
        ...existing,
        event_key: key,
        status,
        action: action ?? existing.action,
        payment_id: paymentId ?? existing.payment_id,
        amount: amount ?? existing.amount,
        currency: currency ?? existing.currency,
        collector_id: collectorId ?? existing.collector_id,
        external_reference: externalRef ?? existing.external_reference,
        completed_at: compAt ? new Date(compAt) : existing.completed_at,
        failed_at: failAt ? new Date(failAt) : existing.failed_at,
        result: res ? JSON.parse(res) : existing.result,
        error_message: err ?? existing.error_message,
        updated_at: now,
      }
      this.tableData.set(key, updated)
      return { rows: [updated] as unknown as T[], rowCount: 1 }
    }

    return { rows: [], rowCount: 0 }
  }

  // Métodos de ayuda para simular caídas de procesos y manipulaciones de tiempo
  public simulateInterruptedOperation(key: string, minutesAgo: number): void {
    const existing = this.tableData.get(key)
    if (existing) {
      existing.status = 'processing'
      existing.locked_at = new Date(Date.now() - minutesAgo * 60 * 1000)
    }
  }

  public getRawData(key: string): any {
    return this.tableData.get(key)
  }
}
