'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { B2BProduct } from '../lib/catalog'
import { calculateVolumeDiscount } from '../lib/utils'

export interface B2BCartItem {
  sku: string
  title: string
  handle: string
  variantId: string
  basePrice: number
  unitPrice: number
  discountPercent: number
  quantity: number
  totalPrice: number
  packUnit: string
  thumbnail?: string | null
}

export interface RFQRecord {
  id: string
  date: string
  items: B2BCartItem[]
  totalEstimated: number
  notes: string
  status: 'recibida' | 'en_analisis' | 'cotizada'
}

interface B2BCartContextType {
  items: B2BCartItem[]
  totalUnits: number
  totalAmount: number
  minWholesaleUnits: number
  minWholesaleAmount: number
  isMinOrderMet: boolean
  addItem: (product: B2BProduct, quantity: number) => void
  updateQuantity: (sku: string, quantity: number) => void
  removeItem: (sku: string) => void
  clearCart: () => void
  addBulkItems: (entries: { product: B2BProduct; quantity: number }[]) => void
  submitRFQ: (notes: string) => RFQRecord
  rfqHistory: RFQRecord[]
}

const B2BCartContext = createContext<B2BCartContextType | undefined>(undefined)

const MIN_WHOLESALE_UNITS = 3
const MIN_WHOLESALE_AMOUNT = 200000

export function B2BCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<B2BCartItem[]>([])
  const [rfqHistory, setRfqHistory] = useState<RFQRecord[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mercadal_b2b_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
      const savedRfq = localStorage.getItem('mercadal_b2b_rfqs')
      if (savedRfq) {
        setRfqHistory(JSON.parse(savedRfq))
      }
    } catch {}
  }, [])

  const saveItems = (newItems: B2BCartItem[]) => {
    setItems(newItems)
    try {
      localStorage.setItem('mercadal_b2b_cart', JSON.stringify(newItems))
    } catch {}
  }

  const addItem = (product: B2BProduct, quantity: number) => {
    if (quantity <= 0) return
    const existingIndex = items.findIndex((i) => i.sku === product.sku)

    let updated: B2BCartItem[]
    if (existingIndex > -1) {
      const existing = items[existingIndex]
      const newQty = existing.quantity + quantity
      const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
        product.wholesalePrice,
        newQty,
        product.volumeTiers
      )

      updated = [...items]
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        unitPrice,
        discountPercent,
        totalPrice,
      }
    } else {
      const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
        product.wholesalePrice,
        quantity,
        product.volumeTiers
      )

      updated = [
        ...items,
        {
          sku: product.sku,
          title: product.title,
          handle: product.handle,
          variantId: product.variantId,
          basePrice: product.wholesalePrice,
          unitPrice,
          discountPercent,
          quantity,
          totalPrice,
          packUnit: product.packUnit,
          thumbnail: product.thumbnail,
        },
      ]
    }
    saveItems(updated)
  }

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku)
      return
    }

    const updated = items.map((item) => {
      if (item.sku === sku) {
        const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
          item.basePrice,
          quantity
        )
        return {
          ...item,
          quantity,
          unitPrice,
          discountPercent,
          totalPrice,
        }
      }
      return item
    })
    saveItems(updated)
  }

  const removeItem = (sku: string) => {
    const updated = items.filter((i) => i.sku !== sku)
    saveItems(updated)
  }

  const clearCart = () => {
    saveItems([])
  }

  const addBulkItems = (entries: { product: B2BProduct; quantity: number }[]) => {
    let currentItems = [...items]

    for (const { product, quantity } of entries) {
      if (quantity <= 0) continue
      const idx = currentItems.findIndex((i) => i.sku === product.sku)
      if (idx > -1) {
        const newQty = currentItems[idx].quantity + quantity
        const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
          product.wholesalePrice,
          newQty,
          product.volumeTiers
        )
        currentItems[idx] = {
          ...currentItems[idx],
          quantity: newQty,
          unitPrice,
          discountPercent,
          totalPrice,
        }
      } else {
        const { unitPrice, discountPercent, totalPrice } = calculateVolumeDiscount(
          product.wholesalePrice,
          quantity,
          product.volumeTiers
        )
        currentItems.push({
          sku: product.sku,
          title: product.title,
          handle: product.handle,
          variantId: product.variantId,
          basePrice: product.wholesalePrice,
          unitPrice,
          discountPercent,
          quantity,
          totalPrice,
          packUnit: product.packUnit,
          thumbnail: product.thumbnail,
        })
      }
    }
    saveItems(currentItems)
  }

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const isMinOrderMet =
    totalUnits >= MIN_WHOLESALE_UNITS || totalAmount >= MIN_WHOLESALE_AMOUNT

  const submitRFQ = (notes: string): RFQRecord => {
    const rfq: RFQRecord = {
      id: `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('es-AR'),
      items: [...items],
      totalEstimated: totalAmount,
      notes,
      status: 'recibida',
    }
    const updatedHistory = [rfq, ...rfqHistory]
    setRfqHistory(updatedHistory)
    try {
      localStorage.setItem('mercadal_b2b_rfqs', JSON.stringify(updatedHistory))
    } catch {}
    clearCart()
    return rfq
  }

  return (
    <B2BCartContext.Provider
      value={{
        items,
        totalUnits,
        totalAmount,
        minWholesaleUnits: MIN_WHOLESALE_UNITS,
        minWholesaleAmount: MIN_WHOLESALE_AMOUNT,
        isMinOrderMet,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        addBulkItems,
        submitRFQ,
        rfqHistory,
      }}
    >
      {children}
    </B2BCartContext.Provider>
  )
}

export function useB2BCart() {
  const context = useContext(B2BCartContext)
  if (!context) {
    throw new Error('useB2BCart must be used within a B2BCartProvider')
  }
  return context
}
