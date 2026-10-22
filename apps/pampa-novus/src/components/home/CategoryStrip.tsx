import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface CategoryItem {
  name: string
  slug: string
  image: string
  alt: string
}

const CATEGORIES: CategoryItem[] = [
  {
    name: 'MONTURAS',
    slug: 'monturas',
    image: '/images/categories/cat-monturas.jpg',
    alt: 'Colección de Monturas Criollas y de Trabajo',
  },
  {
    name: 'ACCESORIOS',
    slug: 'accesorios',
    image: '/images/categories/cat-accesorios.jpg',
    alt: 'Riendas, bozales y cabezadas de cuero',
  },
  {
    name: 'CUERO',
    slug: 'marroquineria',
    image: '/images/categories/cat-cuero.jpg',
    alt: 'Cinturones, billeteras y marroquinería fina',
  },
  {
    name: 'CAMPO',
    slug: 'campo',
    image: '/images/categories/cat-campo.jpg',
    alt: 'Equipamiento de campo tradicional',
  },
  {
    name: 'REGALOS',
    slug: 'regalos',
    image: '/images/categories/cat-regalos.jpg',
    alt: 'Regalos y piezas de autor en cuero',
  },
]

export function CategoryStrip() {
  return (
    <section id="categorias" className="py-4 sm:py-5 bg-[#FAF7F2] border-b border-[#EFE8DE]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative h-[105px] sm:h-[125px] lg:h-[135px] rounded-[2px] overflow-hidden shadow-sm hover:shadow-subtle transition-all duration-300 block bg-pn-espresso"
            >
              {/* Category Background Image */}
              <Image
                src={cat.image}
                alt={cat.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent group-hover:from-black/90 transition-colors" />

              {/* Card Content: Title & Link */}
              <div className="absolute inset-0 p-3 sm:p-3.5 flex flex-col justify-end">
                <h3 className="font-serif text-[12px] sm:text-[13px] font-bold tracking-[0.18em] text-white uppercase leading-none mb-1">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center text-[10px] font-sans text-pn-crema/90 group-hover:text-white transition-colors">
                  <span>Ver colección</span>
                  <ArrowRight
                    size={11}
                    className="ml-1 group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryStrip
