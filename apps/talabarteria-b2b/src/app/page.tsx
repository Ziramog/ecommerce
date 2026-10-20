import React from 'react'
import { getB2BProducts } from '@/lib/catalog'
import { EquestrianHero } from '@/components/home/EquestrianHero'
import { DisciplineGrid } from '@/components/home/DisciplineGrid'
import { FeaturedWholesaleProducts } from '@/components/home/FeaturedWholesaleProducts'
import { ValuePillars } from '@/components/home/ValuePillars'
import { HeritageStory } from '@/components/home/HeritageStory'

export const revalidate = 60

export default async function HomePage() {
  const products = await getB2BProducts()

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* 1. Hero Principal con Polo & Tarjetas Flotantes */}
      <EquestrianHero />

      {/* 2. Barra de 6 Rubros y Disciplinas (Polo, Salto, Turf, Monturas, Aperos, Accesorios) */}
      <DisciplineGrid />

      {/* 3. Productos Destacados con Guarda B2B (Iniciá sesión para ver precios y stock) */}
      <FeaturedWholesaleProducts products={products} />

      {/* 4. Cuatro Pilares de Valor Mayorista */}
      <ValuePillars />

      {/* 5. Sección Editorial "Nuestra Historia" */}
      <HeritageStory />
    </div>
  )
}
