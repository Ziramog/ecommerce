import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-24 bg-pampa-50 text-center px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded border border-pampa-200 shadow-sm">
        <span className="text-xs uppercase tracking-widest text-leather font-semibold block mb-2">
          Error 404
        </span>
        <h1 className="font-serif text-3xl font-bold text-pampa-950 mb-3">
          Pieza no encontrada
        </h1>
        <p className="text-xs text-pampa-600 mb-6 leading-relaxed">
          La página o producto que estás buscando no existe o fue trasladado en el catálogo.
        </p>
        <Link
          href="/catalogo"
          className="inline-block py-2.5 px-6 bg-leather hover:bg-leather-dark text-white text-xs uppercase tracking-widest font-semibold rounded transition-colors"
        >
          Ir al Catálogo
        </Link>
      </div>
    </div>
  )
}
