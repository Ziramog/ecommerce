'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { StorefrontProduct } from '@/lib/catalog'

export interface CartItem {
  id: string
  variantId: string
  title: string
  handle: string
  thumbnail?: string | null
  price: number
  quantity: number
  sku: string
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: StorefrontProduct, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'pampa_novus_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading cart from storage', e)
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (e) {
        console.error('Error saving cart to storage', e)
      }
    }
  }, [items, isMounted])

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addItem = (product: StorefrontProduct, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === product.variantId)
      if (existing) {
        return prev.map((i) =>
          i.variantId === product.variantId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          variantId: product.variantId,
          title: product.title,
          handle: product.handle,
          thumbnail: product.thumbnail,
          price: product.price,
          quantity,
          sku: product.sku,
        },
      ]
    })
    setIsOpen(true)
  }

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
