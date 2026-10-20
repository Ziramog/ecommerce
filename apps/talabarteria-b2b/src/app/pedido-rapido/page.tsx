import React from 'react'
import { getB2BProducts } from '@/lib/catalog'
import { BulkOrderMatrix } from '@/components/catalog/BulkOrderMatrix'

export const revalidate = 60

export default async function PedidoRapidoPage() {
  const products = await getB2BProducts()

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <BulkOrderMatrix products={products} />
    </div>
  )
}
