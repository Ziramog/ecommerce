import { Hero } from '@/components/home/Hero'
import { BrandHeritage } from '@/components/home/BrandHeritage'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { getB2CProducts } from '@/lib/catalog'

export const revalidate = 60

export default async function HomePage() {
  const products = await getB2CProducts()

  return (
    <>
      <Hero />
      <FeaturedGrid products={products} />
      <BrandHeritage />
    </>
  )
}
