import React, { Suspense } from 'react'
import { getB2BProducts } from '@/lib/catalog'
import { WholesaleCatalogView } from '@/components/catalog/WholesaleCatalogView'

export const revalidate = 60

export default async function CatalogoPage() {
  const products = await getB2BProducts()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] p-8 text-center text-xs text-[#78716C] font-sans">
          Cargando catálogo comercial mayorista...
        </div>
      }
    >
      <WholesaleCatalogView products={products} />
    </Suspense>
  )
}
