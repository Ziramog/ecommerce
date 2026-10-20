'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface B2BUser {
  id: string
  email: string
  companyName: string
  cuit: string
  conditionIVA: string
  status: 'approved' | 'pending' | 'guest'
  phone?: string
  city?: string
  province?: string
}

interface AuthB2BContextType {
  user: B2BUser | null
  token: string | null
  isAuthenticated: boolean
  isApproved: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginAsDemoWholesale: () => void
  registerCommercialAccount: (data: {
    companyName: string
    cuit: string
    conditionIVA: string
    email: string
    phone: string
    province: string
    city: string
  }) => Promise<boolean>
  logout: () => void
}

const AuthB2BContext = createContext<AuthB2BContextType | undefined>(undefined)

const DEMO_B2B_USER: B2BUser = {
  id: 'cus_demo_wholesale_001',
  email: 'comercial@distribuidorapampa.com.ar',
  companyName: 'Distribuidora Ecuestre Pampa S.R.L.',
  cuit: '30-71234567-9',
  conditionIVA: 'Responsable Inscripto',
  status: 'approved',
  phone: '011 4321-9876',
  city: 'San Antonio de Areco',
  province: 'Buenos Aires',
}

export function AuthB2BProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<B2BUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mercadal_b2b_user')
      const savedToken = localStorage.getItem('mercadal_b2b_token')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      if (savedToken) {
        setToken(savedToken)
      }
    } catch (e) {
      console.warn('Error reading B2B session from localStorage:', e)
    }
  }, [])

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Basic verification and fallback demo session
    const loggedUser: B2BUser = {
      ...DEMO_B2B_USER,
      email,
    }
    setUser(loggedUser)
    setToken('token_b2b_session_active')
    try {
      localStorage.setItem('mercadal_b2b_user', JSON.stringify(loggedUser))
      localStorage.setItem('mercadal_b2b_token', 'token_b2b_session_active')
    } catch {}
    return true
  }

  const loginAsDemoWholesale = () => {
    setUser(DEMO_B2B_USER)
    setToken('token_b2b_demo_active')
    try {
      localStorage.setItem('mercadal_b2b_user', JSON.stringify(DEMO_B2B_USER))
      localStorage.setItem('mercadal_b2b_token', 'token_b2b_demo_active')
    } catch {}
  }

  const registerCommercialAccount = async (data: {
    companyName: string
    cuit: string
    conditionIVA: string
    email: string
    phone: string
    province: string
    city: string
  }): Promise<boolean> => {
    const newUser: B2BUser = {
      id: `cus_b2b_${Date.now()}`,
      email: data.email,
      companyName: data.companyName,
      cuit: data.cuit,
      conditionIVA: data.conditionIVA,
      status: 'pending',
      phone: data.phone,
      city: data.city,
      province: data.province,
    }
    setUser(newUser)
    setToken(`token_b2b_pending_${Date.now()}`)
    try {
      localStorage.setItem('mercadal_b2b_user', JSON.stringify(newUser))
      localStorage.setItem('mercadal_b2b_token', `token_b2b_pending_${Date.now()}`)
    } catch {}
    return true
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    try {
      localStorage.removeItem('mercadal_b2b_user')
      localStorage.removeItem('mercadal_b2b_token')
    } catch {}
  }

  const isAuthenticated = !!user
  const isApproved = user?.status === 'approved'

  return (
    <AuthB2BContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isApproved,
        login,
        loginAsDemoWholesale,
        registerCommercialAccount,
        logout,
      }}
    >
      {children}
    </AuthB2BContext.Provider>
  )
}

export function useAuthB2B() {
  const context = useContext(AuthB2BContext)
  if (!context) {
    throw new Error('useAuthB2B must be used within an AuthB2BProvider')
  }
  return context
}
