import React from 'react'
import { getB2BProducts } from '@/lib/catalog'
import { EquestrianHero } from '@/components/home/EquestrianHero'
import { ValuePillars } from '@/components/home/ValuePillars'
import { DisciplineGrid } from '@/components/home/DisciplineGrid'
import { FeaturedWholesaleProducts } from '@/components/home/FeaturedWholesaleProducts'
import { HeritageStory } from '@/components/home/HeritageStory'

export const revalidate = 60

export default async function HomePage() {
  const products = await getB2BProducts()

  return (
    <div className="bg-[#FAF8F5]">
      {/* 1. Hero Principal Fotográfico Full Width */}
      <EquestrianHero />

      {/* 2. Franja Horizontal de Beneficios Mayoristas B2B */}
      <ValuePillars />

      {/* 3. Nuestras Categorías (6 tarjetas rectangulares con fotografía protagonista) */}
      <DisciplineGrid />

      {/* 4. Productos Destacados (Reutilizando ProductCard del catálogo + Aviso General) */}
      <FeaturedWholesaleProducts products={products} />

      {/* 5. Nuestra Historia (Composición Editorial de 2 Columnas) */}
      <HeritageStory />
    </div>
  )
}
