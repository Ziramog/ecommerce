import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HeritageStory() {
  return (
    <section id="historia" className="bg-[#FAF8F5] py-12 sm:py-16 lg:py-20 border-b border-[#E5E5E5] font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="bg-white border border-[#E5E5E5] rounded overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Columna Izquierda: Fotografía de Taller y Oficio */}
          <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-5 min-h-[300px]">
            <Image
              src="/images/products/montura-completa-trabajo.jpg"
              alt="Oficio y talabartería artesanal José Mercadal"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>

          {/* Columna Derecha: Composición Editorial Limpia */}
          <div className="p-6 sm:p-10 lg:p-14 lg:col-span-7 flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#873427] font-bold block mb-2">
              Nuestra Historia
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#202020] leading-tight mb-4">
              Más de 60 años<br />
              <span className="italic font-normal text-[#873427]">
                junto al mundo ecuestre
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#525252] leading-relaxed mb-6 font-normal max-w-xl">
              En Talabartería Mercadal unimos oficio, calidad y pasión por el mundo ecuestre. Desde hace generaciones fabricamos productos que combinan tradición, funcionalidad y una estética atemporal.
            </p>

            <div>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#172B23] hover:text-[#873427] transition-colors group"
              >
                <span>Conocé nuestra historia</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
