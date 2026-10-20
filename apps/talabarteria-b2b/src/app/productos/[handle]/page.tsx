import React from 'react'
import { notFound } from 'next/navigation'
import { getB2BProductByHandle, getB2BProducts } from '@/lib/catalog'
import { B2BProductDetail } from '@/components/product/B2BProductDetail'

export const revalidate = 60

export async function generateStaticParams() {
  const products = await getB2BProducts()
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
  const product = await getB2BProductByHandle(handle)

  if (!product) {
    notFound()
  }

  return <B2BProductDetail product={product} />
}
