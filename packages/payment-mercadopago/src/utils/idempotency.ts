/**
 * WOLFIM Commerce Core — Webhook Idempotency & Deduplication Manager
 *
 * Implements durable idempotency with atomic locking, support for persistent storage
 * (file-system / Redis / database) and resistance to backend process restarts.
 */
import fs from 'node:fs'
import path from 'node:path'

export interface IdempotencyEntry {
  key: string
  status: 'processing' | 'completed' | 'failed'
  action?: string
  paymentId?: string | number
  amount?: number
  currency?: string
  collectorId?: string | number
  externalReference?: string
  createdAt: number
  completedAt?: number
  error?: string
  result?: any
}

export interface IdempotencyStorage {
  acquireLock(key: string, entry: IdempotencyEntry): Promise<boolean>
  get(key: string): Promise<IdempotencyEntry | null>
  save(key: string, entry: IdempotencyEntry): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * In-memory storage adapter (ideal for unit testing)
 */
export class MemoryIdempotencyStorage implements IdempotencyStorage {
  private entries: Map<string, IdempotencyEntry> = new Map()

  async acquireLock(key: string, entry: IdempotencyEntry): Promise<boolean> {
    const existing = this.entries.get(key)
    if (existing && (existing.status === 'processing' || existing.status === 'completed')) {
      return false
    }
    this.entries.set(key, entry)
    return true
  }

  async get(key: string): Promise<IdempotencyEntry | null> {
    return this.entries.get(key) || null
  }

  async save(key: string, entry: IdempotencyEntry): Promise<void> {
    this.entries.set(key, entry)
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key)
  }

  async clear(): Promise<void> {
    this.entries.clear()
  }

  get size(): number {
    return this.entries.size
  }
}

/**
 * File-backed durable storage adapter.
 * Persists entries to disk so idempotency survives backend restarts.
 */
export class FilePersistentIdempotencyStorage implements IdempotencyStorage {
  private readonly filePath: string
  private cache: Map<string, IdempotencyEntry> = new Map()
  private isLoaded: boolean = false

  constructor(storageFilePath: string) {
    this.filePath = storageFilePath
    this.loadFromDisk()
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8')
        const data = JSON.parse(raw)
        if (Array.isArray(data)) {
          this.cache = new Map(data.map((item: IdempotencyEntry) => [item.key, item]))
        }
      }
    } catch {
      // If file is empty or corrupted, initialize empty cache
      this.cache = new Map()
    }
    this.isLoaded = true
  }

  private flushToDisk(): void {
    try {
      const dir = path.dirname(this.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const data = Array.from(this.cache.values())
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8')
    } catch (err) {
      console.error('[IdempotencyStorage] Error escribiendo a disco:', err)
    }
  }

  async acquireLock(key: string, entry: IdempotencyEntry): Promise<boolean> {
    if (!this.isLoaded) this.loadFromDisk()
    const existing = this.cache.get(key)
    if (existing && (existing.status === 'processing' || existing.status === 'completed')) {
      return false
    }
    this.cache.set(key, entry)
    this.flushToDisk()
    return true
  }

  async get(key: string): Promise<IdempotencyEntry | null> {
    if (!this.isLoaded) this.loadFromDisk()
    return this.cache.get(key) || null
  }

  async save(key: string, entry: IdempotencyEntry): Promise<void> {
    if (!this.isLoaded) this.loadFromDisk()
    this.cache.set(key, entry)
    this.flushToDisk()
  }

  async delete(key: string): Promise<void> {
    if (!this.isLoaded) this.loadFromDisk()
    this.cache.delete(key)
    this.flushToDisk()
  }

  async clear(): Promise<void> {
    this.cache.clear()
    this.flushToDisk()
  }

  get size(): number {
    return this.cache.size
  }
}

/**
 * Main Webhook Idempotency Manager
 */
export class WebhookIdempotencyManager {
  private readonly storage: IdempotencyStorage
  private readonly ttlMs: number

  constructor(options?: { storage?: IdempotencyStorage; ttlMinutes?: number }) {
    this.storage = options?.storage || new MemoryIdempotencyStorage()
    this.ttlMs = (options?.ttlMinutes ?? 60) * 60 * 1000 // default 60 min
  }

  /**
   * Generates a canonical idempotency key for an event
   */
  public buildKey(action: string, paymentId: string | number, status: string): string {
    return `mp_evt:${action}:${paymentId}:${status}`
  }

  /**
   * Checks if an event has already been completed
   */
  public async isCompleted(key: string): Promise<boolean> {
    const entry = await this.storage.get(key)
    return entry?.status === 'completed'
  }

  /**
   * Attempts an atomic lock on the event.
   * Returns true if lock was acquired, false if already processing or completed.
   */
  public async acquireLock(
    key: string,
    metadata?: Partial<Omit<IdempotencyEntry, 'key' | 'status' | 'createdAt'>>
  ): Promise<boolean> {
    const entry: IdempotencyEntry = {
      key,
      status: 'processing',
      createdAt: Date.now(),
      ...metadata,
    }
    return await this.storage.acquireLock(key, entry)
  }

  /**
   * Marks the event as successfully processed
   */
  public async markCompleted(key: string, result?: any): Promise<void> {
    const existing = await this.storage.get(key)
    const updated: IdempotencyEntry = existing
      ? {
          ...existing,
          status: 'completed',
          completedAt: Date.now(),
          result,
        }
      : {
          key,
          status: 'completed',
          createdAt: Date.now(),
          completedAt: Date.now(),
          result,
        }

    await this.storage.save(key, updated)
  }

  /**
   * Marks the event as failed, allowing subsequent retransmission to be processed
   */
  public async markFailed(key: string, error?: string): Promise<void> {
    const existing = await this.storage.get(key)
    if (existing) {
      existing.status = 'failed'
      existing.error = error
      await this.storage.save(key, existing)
    } else {
      await this.storage.delete(key)
    }
  }

  /**
   * Retrieves entry details
   */
  public async getEntry(key: string): Promise<IdempotencyEntry | null> {
    return await this.storage.get(key)
  }

  /**
   * Clears storage
   */
  public async reset(): Promise<void> {
    await this.storage.clear()
  }

  /**
   * Exposes underlying storage
   */
  public getStorage(): IdempotencyStorage {
    return this.storage
  }

  /**
   * Current number of entries in memory (for testing)
   */
  public get size(): number {
    if (this.storage instanceof MemoryIdempotencyStorage) {
      return (this.storage as any).entries.size
    }
    return 0
  }
}
