import React from 'react'
import { getB2BProducts } from '@/lib/catalog'
import { WholesaleCatalogView } from '@/components/catalog/WholesaleCatalogView'

export const revalidate = 60

export default async function CatalogoPage() {
  const products = await getB2BProducts()

  return <WholesaleCatalogView products={products} />
}
