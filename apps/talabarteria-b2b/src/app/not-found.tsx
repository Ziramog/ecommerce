import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-24 bg-b2b-50 text-center px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded border border-b2b-200 shadow-sm">
        <span className="text-xs uppercase tracking-widest text-saddle font-semibold block mb-2">
          Error 404
        </span>
        <h1 className="font-heading text-2xl font-bold text-navy mb-3 uppercase">
          Línea Comercial no Encontrada
        </h1>
        <p className="text-xs text-b2b-600 mb-6 leading-relaxed">
          La página, código de SKU o sección mayorista solicitada no existe o fue reorganizada en la lista oficial.
        </p>
        <Link
          href="/catalogo"
          className="inline-block py-2.5 px-6 bg-navy hover:bg-navy-light text-white text-xs uppercase tracking-widest font-semibold rounded transition-colors"
        >
          Ir al Catálogo Mayorista
        </Link>
      </div>
    </div>
  )
}
