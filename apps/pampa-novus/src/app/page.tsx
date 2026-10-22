import { Hero } from '@/components/home/Hero'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { BrandHeritage } from '@/components/home/BrandHeritage'
import { getB2CProducts } from '@/lib/catalog'

export const revalidate = 60

export default async function HomePage() {
  const products = await getB2CProducts()

  return (
    <>
      <Hero />
      <CategoryStrip />
      <FeaturedGrid products={products} />
      <BrandHeritage />
    </>
  )
}
