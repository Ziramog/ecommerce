'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { StorefrontProduct } from '@/lib/catalog'
import { getArgentinaRegionId } from '@/lib/catalog'
import { medusa } from '@/lib/medusa'
import {
  CartGateway,
  type CommerceCart,
  type CommerceLineItem,
  isMockFallbackAllowed,
} from '@mercadal/commerce-core'

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
  cart: CommerceCart | null
  cartId: string | null
  isOpen: boolean
  isLoading: boolean
  error: string | null
  openCart: () => void
  closeCart: () => void
  addItem: (product: StorefrontProduct, quantity?: number) => Promise<void>
  removeItem: (variantIdOrLineId: string) => Promise<void>
  updateQuantity: (variantIdOrLineId: string, quantity: number) => Promise<void>
  clearCart: () => void
  refreshCart: () => Promise<void>
  cartGateway: CartGateway
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_ID_KEY = 'pampa_novus_cart_id_v2'
const CART_FALLBACK_ITEMS_KEY = 'pampa_novus_cart_items_fallback'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CommerceCart | null>(null)
  const [cartId, setCartId] = useState<string | null>(null)
  const [fallbackItems, setFallbackItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const cartGateway = useMemo(() => new CartGateway(medusa), [])

  // Sync state from server cart
  const syncServerCart = useCallback((serverCart: CommerceCart | null) => {
    setCart(serverCart)
    if (serverCart) {
      setCartId(serverCart.id)
      try {
        localStorage.setItem(CART_STORAGE_ID_KEY, serverCart.id)
      } catch {}
    }
  }, [])

  // Rehydrate cart from Medusa 2 on load
  useEffect(() => {
    setIsMounted(true)
    const initCart = async () => {
      try {
        const storedCartId = localStorage.getItem(CART_STORAGE_ID_KEY)
        if (storedCartId) {
          setIsLoading(true)
          const retrieved = await cartGateway.getCart(storedCartId)
          if (retrieved && retrieved.status !== 'completed') {
            syncServerCart(retrieved)
          } else {
            // Cart expired or already completed
            localStorage.removeItem(CART_STORAGE_ID_KEY)
            setCartId(null)
            setCart(null)
          }
        } else if (isMockFallbackAllowed()) {
          const savedFallback = localStorage.getItem(CART_FALLBACK_ITEMS_KEY)
          if (savedFallback) {
            setFallbackItems(JSON.parse(savedFallback))
          }
        }
      } catch (err) {
        console.warn('[CartContext] No se pudo recuperar carrito de Medusa:', err)
        if (isMockFallbackAllowed()) {
          const savedFallback = localStorage.getItem(CART_FALLBACK_ITEMS_KEY)
          if (savedFallback) {
            setFallbackItems(JSON.parse(savedFallback))
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    initCart()
  }, [cartGateway, syncServerCart])

  // Save fallback items strictly when mock fallback is allowed
  useEffect(() => {
    if (isMounted && isMockFallbackAllowed()) {
      try {
        localStorage.setItem(CART_FALLBACK_ITEMS_KEY, JSON.stringify(fallbackItems))
      } catch {}
    }
  }, [fallbackItems, isMounted])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  // Map server items to backwards-compatible CartItem format
  const items: CartItem[] = useMemo(() => {
    if (cart && cart.items.length > 0) {
      return cart.items.map((it: CommerceLineItem) => ({
        id: it.id,
        variantId: it.variantId,
        title: it.title,
        handle: (it.metadata?.handle as string) || it.title.toLowerCase().replace(/\s+/g, '-'),
        thumbnail: it.thumbnail,
        price: it.unitPrice,
        quantity: it.quantity,
        sku: it.sku || '',
      }))
    }
    return fallbackItems
  }, [cart, fallbackItems])

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = cart?.totals.subtotal ?? items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Ensures an active Medusa cart exists
  const ensureServerCart = async (): Promise<string> => {
    if (cartId && cart) {
      return cartId
    }
    const regionId = await getArgentinaRegionId()
    const newCart = await cartGateway.createCart({
      regionId,
    })
    syncServerCart(newCart)
    return newCart.id
  }

  const addItem = async (product: StorefrontProduct, quantity: number = 1) => {
    setError(null)
    setIsLoading(true)
    setIsOpen(true)

    // Optimistic fallback update for instant UI feedback
    if (isMockFallbackAllowed()) {
      setFallbackItems((prev) => {
        const existing = prev.find((i) => i.variantId === product.variantId)
        if (existing) {
          return prev.map((i) =>
            i.variantId === product.variantId ? { ...i, quantity: i.quantity + quantity } : i
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
    }

    try {
      const activeCartId = await ensureServerCart()
      const updatedCart = await cartGateway.addLineItem(activeCartId, product.variantId, quantity)
      syncServerCart(updatedCart)
    } catch (err: any) {
      console.warn('[CartContext] Error agregando ítem a Medusa 2:', err)
      if (!isMockFallbackAllowed()) {
        setError('No se pudo sincronizar el producto con el servidor.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (variantIdOrLineId: string) => {
    setIsLoading(true)
    setError(null)

    // Fallback removal
    if (isMockFallbackAllowed()) {
      setFallbackItems((prev) =>
        prev.filter((i) => i.variantId !== variantIdOrLineId && i.id !== variantIdOrLineId)
      )
    }

    if (cart && cartId) {
      try {
        const target = cart.items.find(
          (i) => i.id === variantIdOrLineId || i.variantId === variantIdOrLineId
        )
        if (target) {
          const updated = await cartGateway.removeLineItem(cartId, target.id)
          syncServerCart(updated)
        }
      } catch (err: any) {
        console.error('[CartContext] Error al eliminar ítem:', err)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (variantIdOrLineId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(variantIdOrLineId)
    }

    setIsLoading(true)
    setError(null)

    // Fallback update
    if (isMockFallbackAllowed()) {
      setFallbackItems((prev) =>
        prev.map((i) =>
          i.variantId === variantIdOrLineId || i.id === variantIdOrLineId ? { ...i, quantity } : i
        )
      )
    }

    if (cart && cartId) {
      try {
        const target = cart.items.find(
          (i) => i.id === variantIdOrLineId || i.variantId === variantIdOrLineId
        )
        if (target) {
          const updated = await cartGateway.updateLineItem(cartId, target.id, quantity)
          syncServerCart(updated)
        }
      } catch (err: any) {
        console.error('[CartContext] Error al actualizar cantidad:', err)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }

  const clearCart = () => {
    setCart(null)
    setCartId(null)
    setFallbackItems([])
    try {
      localStorage.removeItem(CART_STORAGE_ID_KEY)
      localStorage.removeItem(CART_FALLBACK_ITEMS_KEY)
    } catch {}
  }

  const refreshCart = async () => {
    if (cartId) {
      try {
        setIsLoading(true)
        const updated = await cartGateway.getCart(cartId)
        syncServerCart(updated)
      } catch (err) {
        console.error('[CartContext] Error refrescando carrito:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        cart,
        cartId,
        isOpen,
        isLoading,
        error,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        cartGateway,
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
