import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export interface CategoryCardItem {
  name: string
  subtitle: string
  href: string
  image: string
  objectPosition?: string
}

export const CATEGORY_CARDS_DATA: CategoryCardItem[] = [
  {
    name: 'POLO',
    subtitle: 'Equipamiento y accesorios para el juego.',
    href: '/catalogo?disciplina=polo',
    image: '/images/home/disciplina-polo.jpg',
    objectPosition: 'center',
  },
  {
    name: 'SALTO',
    subtitle: 'Monturas y accesorios de alto rendimiento.',
    href: '/catalogo?disciplina=salto',
    image: '/images/home/disciplina-salto.jpg',
    objectPosition: 'center',
  },
  {
    name: 'TURF',
    subtitle: 'Artículos y accesorios para entrenamiento y competencia.',
    href: '/catalogo?disciplina=turf',
    image: '/images/home/disciplina-turf.jpg',
    objectPosition: 'center',
  },
  {
    name: 'MONTURAS',
    subtitle: 'Monturas completas y accesorios.',
    href: '/catalogo?categoria=Monturas',
    image: '/images/home/disciplina-monturas.jpg',
    objectPosition: 'center',
  },
  {
    name: 'APEROS',
    subtitle: 'Recados, riendas y artículos de tradición.',
    href: '/catalogo?categoria=Aperos',
    image: '/images/home/disciplina-aperos.jpg',
    objectPosition: 'center',
  },
  {
    name: 'ACCESORIOS',
    subtitle: 'Bastos, cinchas, estribos y más.',
    href: '/catalogo?categoria=Accesorios',
    image: '/images/home/disciplina-accesorios.jpg',
    objectPosition: 'center',
  },
]

export function DisciplineGrid() {
  return (
    <section className="bg-[#FAF8F5] py-6 sm:py-8 lg:py-10 border-b border-[#E8E2D8]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORY_CARDS_DATA.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-end p-3.5 sm:p-4"
            >
              {/* Background Image with subtle zoom on hover */}
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                style={{ objectPosition: item.objectPosition || 'center' }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              {/* Gradient localized at bottom for high text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-45% to-transparent pointer-events-none" />

              {/* Text content & circular arrow */}
              <div className="relative z-10 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-serif text-base sm:text-lg xl:text-xl font-bold text-white tracking-wide uppercase leading-tight mb-1">
                    {item.name}
                  </h3>
                  {/* Línea decorativa corta en tono cuero/bordó */}
                  <div className="w-7 h-[2px] bg-[#873528] rounded-full mb-1.5 group-hover:w-10 transition-all duration-300" />
                  <p className="text-[10px] sm:text-[11px] text-white/90 line-clamp-2 leading-tight font-sans font-normal">
                    {item.subtitle}
                  </p>
                </div>

                {/* Flecha circular alineada a la derecha */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/50 bg-black/25 group-hover:bg-white text-white group-hover:text-[#1F1E1D] flex items-center justify-center flex-shrink-0 transition-all backdrop-blur-xs group-hover:scale-105">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
