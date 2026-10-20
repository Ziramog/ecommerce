import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductByHandle, getB2CProducts } from '@/lib/catalog'
import { formatCurrencyARS, formatInstallments } from '@/lib/utils'
import { ProductAddToCart } from '@/components/product/ProductAddToCart'
import { ShieldCheck, Truck, RotateCcw, ChevronRight, CheckCircle2 } from 'lucide-react'

export const revalidate = 60

export async function generateStaticParams() {
  const products = await getB2CProducts()
  return products.map((p) => ({
    handle: p.handle,
  }))
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    notFound()
  }

  return (
    <div className="py-12 bg-pampa-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-pampa-500 mb-8">
          <Link href="/" className="hover:text-leather transition-colors">Inicio</Link>
          <ChevronRight size={12} />
          <Link href="/catalogo" className="hover:text-leather transition-colors">Catálogo</Link>
          <ChevronRight size={12} />
          <span className="text-pampa-900 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery image */}
          <div className="relative aspect-[4/5] bg-pampa-100 rounded-lg overflow-hidden border border-pampa-200 shadow-sm">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pampa-400 font-serif">
                Pampa Novus
              </div>
            )}
            <div className="absolute top-4 left-4 bg-pampa-950/80 backdrop-blur-sm text-pampa-100 text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 font-medium rounded">
              Genuino Argentino
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs text-pampa-500 font-mono uppercase mb-2">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span className="inline-flex items-center text-green-700 font-sans font-medium">
                  <CheckCircle2 size={13} className="mr-1" />
                  Stock Disponible
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pampa-950 tracking-tight leading-tight mb-4">
                {product.title}
              </h1>

              {/* Price section */}
              <div className="p-5 bg-white border border-pampa-200 rounded-lg mb-6 shadow-sm">
                <div className="flex items-baseline space-x-3 mb-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-pampa-950">
                    {formatCurrencyARS(product.price)}
                  </span>
                  <span className="text-xs text-pampa-500 uppercase tracking-wider">Precio Final B2C</span>
                </div>
                <p className="text-xs text-pampa-700 font-medium">
                  {formatInstallments(product.price, 3)}
                </p>
                <div className="mt-3 pt-3 border-t border-pampa-100 flex items-center justify-between text-xs text-pampa-600">
                  <span>💳 Acepta todas las tarjetas y Mercado Pago</span>
                  <span className="text-leather font-semibold">10% OFF pagando con transferencia</span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-pampa-900 mb-2">
                    Detalles de la Pieza
                  </h3>
                  <p className="text-sm text-pampa-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Add to cart interactive client component */}
              <ProductAddToCart product={product} />
            </div>

            {/* Value reassurance badges */}
            <div className="mt-10 pt-6 border-t border-pampa-200 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white/60 rounded border border-pampa-200/60">
                <Truck className="w-5 h-5 mx-auto text-leather mb-1.5" />
                <span className="block text-[11px] font-semibold text-pampa-900">Envío Asegurado</span>
                <span className="block text-[10px] text-pampa-500">A todo el país</span>
              </div>
              <div className="p-3 bg-white/60 rounded border border-pampa-200/60">
                <ShieldCheck className="w-5 h-5 mx-auto text-leather mb-1.5" />
                <span className="block text-[11px] font-semibold text-pampa-900">Cuero Auténtico</span>
                <span className="block text-[10px] text-pampa-500">Garantía de taller</span>
              </div>
              <div className="p-3 bg-white/60 rounded border border-pampa-200/60">
                <RotateCcw className="w-5 h-5 mx-auto text-leather mb-1.5" />
                <span className="block text-[11px] font-semibold text-pampa-900">Cambio Simple</span>
                <span className="block text-[10px] text-pampa-500">30 días de cambio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
