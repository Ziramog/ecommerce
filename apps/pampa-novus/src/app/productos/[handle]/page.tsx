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
    <div className="py-8 sm:py-12 bg-[#FAF7F2] min-h-[75vh]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-pn-espresso/60 mb-6 font-sans">
          <Link href="/" className="hover:text-pn-cognac transition-colors">Inicio</Link>
          <ChevronRight size={12} />
          <Link href="/catalogo" className="hover:text-pn-cognac transition-colors">Catálogo</Link>
          <ChevronRight size={12} />
          <span className="text-pn-espresso font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery image */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] bg-[#F8F5EE] rounded-[2px] overflow-hidden border border-[#EFE8DE] shadow-subtle">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                priority
                className="object-contain p-6 sm:p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pn-arena font-serif">
                Pampa Novus
              </div>
            )}
            <div className="absolute top-3 left-3 bg-pn-marron text-white text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 font-medium rounded-[1px] shadow-sm select-none">
              Genuino Criollo
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs text-pn-espresso/60 font-mono uppercase mb-2">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span className="inline-flex items-center text-green-800 font-sans font-medium">
                  <CheckCircle2 size={13} className="mr-1" />
                  Stock Disponible
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-pn-espresso tracking-tight leading-tight mb-4">
                {product.title}
              </h1>

              {/* Price section */}
              <div className="p-5 bg-white border border-[#EFE8DE] rounded-[2px] mb-6 shadow-subtle">
                <div className="flex items-baseline space-x-3 mb-1">
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-pn-espresso">
                    {formatCurrencyARS(product.price)}
                  </span>
                  <span className="text-[11px] text-pn-espresso/60 uppercase tracking-wider font-sans">Precio Final B2C</span>
                </div>
                <p className="text-xs text-pn-marron font-medium font-sans">
                  {formatInstallments(product.price, 3)}
                </p>
                <div className="mt-3 pt-3 border-t border-[#EFE8DE] flex items-center justify-between text-xs text-pn-espresso/70 font-sans">
                  <span>💳 Todas las tarjetas bancarias</span>
                  <span className="text-pn-cognac font-semibold">10% OFF transferencia directa</span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6 font-sans">
                  <h3 className="text-xs uppercase tracking-[0.16em] text-pn-cognac font-semibold mb-2">
                    Detalles y Confección
                  </h3>
                  <p className="text-xs sm:text-sm text-pn-espresso/80 leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Add to Cart client component */}
              <div className="mb-6">
                <ProductAddToCart product={product} />
              </div>
            </div>

            {/* Assurance badges */}
            <div className="pt-6 border-t border-[#EFE8DE] grid grid-cols-3 gap-3 text-center text-xs text-pn-espresso/80 font-sans">
              <div className="p-3 bg-white border border-[#EFE8DE] rounded-[2px]">
                <Truck className="w-5 h-5 text-pn-cognac mx-auto mb-1.5" strokeWidth={1.6} />
                <span className="font-semibold block text-[11px]">Envío Seguro</span>
                <span className="text-[10px] text-pn-espresso/60">A todo el país</span>
              </div>
              <div className="p-3 bg-white border border-[#EFE8DE] rounded-[2px]">
                <ShieldCheck className="w-5 h-5 text-pn-cognac mx-auto mb-1.5" strokeWidth={1.6} />
                <span className="font-semibold block text-[11px]">Garantía Real</span>
                <span className="text-[10px] text-pn-espresso/60">Origen artesanal</span>
              </div>
              <div className="p-3 bg-white border border-[#EFE8DE] rounded-[2px]">
                <RotateCcw className="w-5 h-5 text-pn-cognac mx-auto mb-1.5" strokeWidth={1.6} />
                <span className="font-semibold block text-[11px]">Cambios</span>
                <span className="text-[10px] text-pn-espresso/60">30 días de plazo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
