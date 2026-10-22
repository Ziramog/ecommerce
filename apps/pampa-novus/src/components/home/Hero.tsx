import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative h-auto min-h-[380px] sm:min-h-[390px] lg:h-[420px] flex items-center overflow-hidden bg-[#EAE2D5] border-b border-[#EFE8DE] py-10 sm:py-0">
      {/* Panorámica ecuestre: caballo ensillado y paisano al centro/derecha */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/home/hero-equestrian-master.jpg"
          alt="Raíces ecuestres, estilo contemporáneo — Pampa Novus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] sm:object-[68%_center] lg:object-center select-none"
        />
        {/* Degradado suave para máxima legibilidad del bloque editorial en mobile y tablet */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/95 via-[#FAF7F2]/80 to-transparent sm:via-[#FAF7F2]/30 lg:to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Columna Izquierda: Bloque Editorial Titular y CTA */}
          <div className="lg:col-span-7 xl:col-span-6">
            <span className="text-[11px] font-sans uppercase tracking-[0.22em] text-pn-cognac font-medium block mb-2">
              TALABARTERÍA MERCADAL
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-pn-espresso leading-[1.08] mb-3">
              Raíces ecuestres.
              <span className="block font-normal italic text-pn-marron">
                Estilo contemporáneo.
              </span>
            </h1>

            {/* Línea divisoria artesanal */}
            <div className="w-12 h-[1.5px] bg-pn-cognac/80 mb-3.5" />

            <p className="text-xs sm:text-sm text-pn-espresso/90 font-sans leading-relaxed mb-5 sm:mb-6 max-w-[280px] sm:max-w-md font-normal">
              Accesorios, indumentaria y objetos de cuero para una vida en el campo, hoy.
            </p>

            <div>
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2.5 bg-pn-marron hover:bg-pn-espresso text-white px-6 py-2.5 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-sans font-medium transition-all duration-200 rounded-[2px] shadow-sm group"
              >
                <span>COMPRAR AHORA</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Sello Institucional */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end items-start pr-4 xl:pr-8 pointer-events-none select-none">
            <div className="text-right text-pn-espresso/90">
              <span className="block font-sans font-bold text-xs tracking-[0.25em] uppercase">
                PAMPA
              </span>
              <span className="block font-sans font-bold text-xs tracking-[0.25em] uppercase mt-0.5">
                NOVUS
              </span>
              <div className="w-8 h-[1px] bg-pn-cognac/60 ml-auto my-1.5" />
              <span className="block text-[9px] font-sans tracking-[0.22em] uppercase text-pn-marron font-medium leading-relaxed">
                TRADICIÓN<br />
                QUE ACOMPAÑA<br />
                TU CAMINO
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
