import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export interface DisciplineItem {
  name: string
  subtitle: string
  href: string
  image: string
}

const DISCIPLINES_DATA: DisciplineItem[] = [
  {
    name: 'POLO',
    subtitle: 'Equipamiento y accesorios para el juego.',
    href: '/catalogo?disciplina=polo',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'SALTO',
    subtitle: 'Monturas y accesorios de alto rendimiento.',
    href: '/catalogo?disciplina=salto',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'TURF',
    subtitle: 'Artículos y accesorios para entrenamiento y competencia.',
    href: '/catalogo?disciplina=turf',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'MONTURAS',
    subtitle: 'Monturas completas y accesorios.',
    href: '/catalogo?disciplina=monturas',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'APEROS',
    subtitle: 'Recados, riendas y artículos de tradición.',
    href: '/catalogo?disciplina=aperos',
    image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'ACCESORIOS',
    subtitle: 'Bastos, cinchas, estribos y más.',
    href: '/catalogo?disciplina=accesorios',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
  },
]

export function DisciplineGrid() {
  return (
    <section className="bg-[#FAF8F5] py-8 sm:py-10 border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {DISCIPLINES_DATA.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-end p-3.5"
            >
              {/* Background Image */}
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Text content & circular arrow */}
              <div className="relative z-10 flex items-end justify-between gap-2">
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide uppercase leading-tight mb-1">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-white/80 line-clamp-2 leading-tight font-sans">
                    {item.subtitle}
                  </p>
                </div>

                <div className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-[#1F1E1D] flex items-center justify-center flex-shrink-0 transition-colors backdrop-blur-sm">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
