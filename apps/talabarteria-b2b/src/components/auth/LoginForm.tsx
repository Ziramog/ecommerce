'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthB2B } from '@/context/AuthB2BContext'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const { login, loginAsDemoWholesale } = useAuthB2B()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor complete todos los campos requeridos.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      router.push('/catalogo')
    } catch {
      setError('Error de autenticación. Verifique sus credenciales comerciales.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    loginAsDemoWholesale()
    router.push('/catalogo')
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-b2b-200 shadow-sm">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold text-navy mb-1 uppercase tracking-wider">
          Ingreso de Clientes Comerciales
        </h2>
        <p className="text-xs text-b2b-500">
          Ingrese con el correo electrónico corporativo registrado para ver listas de precios mayoristas.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-b2b-700 mb-1">
            Correo Electrónico Comercial *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-b2b-400 absolute left-3 top-2.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="compras@suempresa.com.ar"
              className="w-full pl-9 pr-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-b2b-700 mb-1">
            Contraseña *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-b2b-400 absolute left-3 top-2.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs border border-b2b-300 rounded focus:outline-none focus:border-navy text-b2b-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-navy hover:bg-navy-light text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Validando...' : 'Iniciar Sesión Mayorista'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Fast Track */}
      <div className="mt-6 pt-6 border-t border-b2b-100">
        <span className="text-[11px] text-b2b-400 block mb-2 font-medium">
          Entorno de Evaluación / PoC:
        </span>
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2 px-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Acceder con Cuenta Mayorista Verificada (Distribuidora Pampa)
        </button>
      </div>
    </div>
  )
}
