import React from 'react'
import Link from 'next/link'
import { getB2BProducts } from '@/lib/catalog'
import { WholesaleProductCard } from '@/components/catalog/WholesaleProductCard'
import { Building2, ShieldCheck, Layers, FileText, ArrowRight, Truck } from 'lucide-react'

export const revalidate = 60

export default async function HomePage() {
  const products = await getB2BProducts()
  const featured = products.slice(0, 6)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-navy text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-navy-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-saddle/30 border border-saddle text-saddle-light text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Canal Mayorista & Distribución Directa
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold uppercase tracking-wide leading-tight mb-4">
              Aperos Criollos & Cueros de Trabajo al Por Mayor
            </h1>
            <p className="text-b2b-300 text-sm sm:text-base mb-8 leading-relaxed">
              Abastecimiento directo de fábrica para talabarterías, veterinarias rurales, corralones de campo y distribuidores de todo el país. Precios escalonados por volumen, stock en tiempo real y facturación oficial A y B.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/catalogo"
                className="py-3 px-6 bg-saddle hover:bg-saddle-dark text-white text-xs uppercase font-bold tracking-wider rounded transition-colors shadow-md flex items-center gap-2"
              >
                Ver Catálogo Mayorista
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pedido-rapido"
                className="py-3 px-6 bg-navy-light hover:bg-navy-light/80 text-white border border-navy-light text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-saddle-light" />
                Matriz de Pedido Rápido
              </Link>
              <Link
                href="/acceso"
                className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Solicitar Cuenta Comercial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Badges */}
      <section className="bg-white border-b border-b2b-200 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <span className="font-mono text-xl font-bold text-navy block">3 un.</span>
            <span className="text-[11px] text-b2b-500 uppercase tracking-wider font-semibold">
              Mínimo de Compra
            </span>
          </div>
          <div className="p-3 border-l border-b2b-200">
            <span className="font-mono text-xl font-bold text-emerald-700 block">Hasta -20%</span>
            <span className="text-[11px] text-b2b-500 uppercase tracking-wider font-semibold">
              Escala por Volumen
            </span>
          </div>
          <div className="p-3 border-l border-b2b-200">
            <span className="font-mono text-xl font-bold text-navy block">Factura A</span>
            <span className="text-[11px] text-b2b-500 uppercase tracking-wider font-semibold">
              Electrónica ARCA
            </span>
          </div>
          <div className="p-3 border-l border-b2b-200">
            <span className="font-mono text-xl font-bold text-navy block">48/72 hs</span>
            <span className="text-[11px] text-b2b-500 uppercase tracking-wider font-semibold">
              Despacho a Expresos
            </span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-saddle tracking-widest block mb-1">
              Catálogo Oficial Mayorista
            </span>
            <h2 className="font-heading text-2xl font-bold text-navy uppercase">
              Piezas & Lotes en Stock para Distribución
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-xs font-semibold text-navy hover:text-saddle flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            Ver todos los productos ({products.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product) => (
            <WholesaleProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Institutional Callout */}
      <section className="bg-b2b-100/70 border-t border-b2b-200 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-heading text-2xl font-bold text-navy uppercase mb-3">
              ¿Necesita confecciones a medida o pedidos a granel?
            </h3>
            <p className="text-xs text-b2b-600 leading-relaxed mb-6">
              Nuestra oficina técnica cotiza producciones especiales para estancias, federaciones ecuestres, comparsas y marcas de indumentaria. Confeccionamos con cueros seleccionados y herrajes propios.
            </p>
            <Link
              href="/cotizacion"
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-navy hover:bg-navy-light text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              <FileText className="w-4 h-4 text-saddle-light" />
              Solicitar Cotización por Volumen (RFQ)
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg border border-b2b-200 shadow-sm">
            <h4 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-saddle" />
              Modalidades de Entrega Mayorista
            </h4>
            <ul className="space-y-2 text-xs text-b2b-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-navy">•</span>
                <span>
                  <strong>Depósito Central CABA:</strong> Retiro con transporte propio sin costo de embalaje.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-navy">•</span>
                <span>
                  <strong>Expresos al Interior:</strong> Despacho consolidado en Villa Soldati / Pompeya (Cruz del Sur, La Sevillanita, Expreso Rivadavia, entre otros).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-navy">•</span>
                <span>
                  <strong>Pallet Cerrado:</strong> Embalaje termoencogible para rollos de lonja y monturas apiladas.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
