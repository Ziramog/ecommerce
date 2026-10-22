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
    subtitle: 'Artículos y accesorios entrenamiento y competencia.',
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
    subtitle: 'Riendas, filetería y artículos de tradición.',
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
    <section className="bg-[#FAF8F5] py-10 sm:py-14 border-b border-[#E5E5E5] font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Cabecera de la sección */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
            Nuestras categorías
          </h2>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#172B23] hover:text-[#873427] transition-colors group"
          >
            <span>Ver todas las categorías</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grilla de 6 tarjetas rectangulares (Radio 4px, fotografía protagonista) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORY_CARDS_DATA.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative aspect-[3/4] rounded overflow-hidden border border-[#E5E5E5] hover:border-[#873427] transition-all flex flex-col justify-end p-3.5 sm:p-4"
            >
              {/* Fotografía protagonista con zoom suave al hover */}
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                style={{ objectPosition: item.objectPosition || 'center' }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              {/* Degradado inferior mínimo para legibilidad de textos */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-40% to-transparent pointer-events-none" />

              {/* Textos y flecha */}
              <div className="relative z-10 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide uppercase leading-tight mb-1">
                    {item.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-white/90 line-clamp-2 leading-tight font-sans font-normal">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-white/80 group-hover:text-white flex-shrink-0 mb-0.5">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
