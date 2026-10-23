import { Hero } from '@/components/home/Hero'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { BrandHeritage } from '@/components/home/BrandHeritage'
import { getB2CProducts, STATIC_B2C_FALLBACK_PRODUCTS, StorefrontProduct } from '@/lib/catalog'

export const revalidate = 60

export default async function HomePage() {
  let products: StorefrontProduct[] = []
  try {
    products = await getB2CProducts()
  } catch (err) {
    console.warn('[HomePage] Error al obtener productos del backend:', err)
    products = STATIC_B2C_FALLBACK_PRODUCTS
  }

  return (
    <>
      <Hero />
      <CategoryStrip />
      <FeaturedGrid products={products} />
      <BrandHeritage />
    </>
  )
}
