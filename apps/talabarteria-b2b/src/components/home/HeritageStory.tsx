import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HeritageStory() {
  return (
    <section id="historia" className="bg-[#FAF8F5] py-16 sm:py-20 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Imagen Izquierda: Taller / Cuero Artesanal */}
          <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-4 min-h-[260px]">
            <Image
              src="/images/products/montura-completa-trabajo.jpg"
              alt="Talabartería y cuero artesanal argentino"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Bloque Central: Manifiesto y Storytelling */}
          <div className="p-8 sm:p-10 lg:p-12 lg:col-span-5 flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8C7355] font-bold block mb-2">
              Nuestra Historia
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F1E1D] leading-tight mb-4">
              Tradición que acompaña{' '}
              <span className="italic font-normal text-[#6B3A2A]">nuevos caminos.</span>
            </h2>

            <p className="text-sm text-[#57534E] leading-relaxed mb-6 font-normal">
              En Talabartería Mercadal unimos oficio, calidad y pasión por el mundo ecuestre. Desde hace generaciones fabricamos productos que combinan tradición, funcionalidad y una estética atemporal.
            </p>

            <div>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#1C3B2B] hover:text-[#14291E] transition-colors group"
              >
                <span>Conocé nuestra historia</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bloque Derecho: Polo Field & Logo Lockup */}
          <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-3 bg-[#FAF8F5] border-t lg:border-t-0 lg:border-l border-[#E8E2D8] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <Image
              src="/images/home/hero-polo-action.jpg"
              alt="Jinetes y polo argentino"
              fill
              className="object-cover object-center opacity-25"
              sizes="(max-width: 1024px) 100vw, 25vw"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
                <Image
                  src="/images/brand/isologo-jm-transparent.png"
                  alt="Isologo JM José Mercadal"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-6 w-44 mb-1">
                <Image
                  src="/images/brand/logo-jose-mercadal-transparent.png"
                  alt="José Mercadal"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-[7.5px] tracking-[0.25em] text-[#78716C] font-semibold uppercase leading-tight mt-1 max-w-[180px]">
                Tradición que acompaña nuevos caminos.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
