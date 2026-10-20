'use client'

import React, { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Building2, UserCheck, Shield } from 'lucide-react'

export default function AccesoPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-saddle font-bold mb-2">
          <Shield className="w-3.5 h-3.5" />
          Plataforma Mayorista Privada
        </span>
        <h1 className="font-heading text-3xl font-bold text-navy uppercase">
          Portal de Clientes Comerciales
        </h1>
        <p className="text-xs text-b2b-500 mt-2 max-w-md mx-auto">
          Acceda con sus credenciales de distribuidor o solicite la apertura de su cuenta comercial para acceder a listas de precios directas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-b2b-200 mb-8 max-w-md mx-auto">
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            tab === 'login'
              ? 'border-navy text-navy font-bold'
              : 'border-transparent text-b2b-400 hover:text-b2b-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Iniciar Sesión
        </button>
        <button
          onClick={() => setTab('register')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            tab === 'register'
              ? 'border-saddle text-saddle-dark font-bold'
              : 'border-transparent text-b2b-400 hover:text-b2b-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Apertura de Cuenta
        </button>
      </div>

      {/* Active Form */}
      <div>{tab === 'login' ? <LoginForm /> : <RegisterForm />}</div>
    </div>
  )
}
