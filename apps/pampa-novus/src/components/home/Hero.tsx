import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroMediaBackground } from './HeroMediaBackground'

export function Hero() {
  return (
    <section className="relative h-auto min-h-[350px] sm:min-h-[370px] lg:h-[400px] xl:h-[415px] flex items-center overflow-hidden bg-[#2E1C12] border-b border-[#EFE8DE] py-10 sm:py-0">
      {/* Secuencia cinematográfica continua: hero_video.mp4 -> hero_video2.mp4 -> foto master (10s) -> loop */}
      <HeroMediaBackground />

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Columna Izquierda: Bloque Editorial Titular y CTA */}
          <div className="lg:col-span-7 xl:col-span-6">
            <span className="text-xs sm:text-[13px] font-sans uppercase tracking-[0.18em] text-pn-cognac font-medium block mb-2.5">
              TALABARTERÍA MERCADAL
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-bold tracking-tight text-pn-espresso leading-[1.06] mb-3.5">
              Raíces ecuestres.
              <span className="block font-normal italic text-pn-marron mt-0.5">
                Estilo contemporáneo.
              </span>
            </h1>

            {/* Línea divisoria artesanal */}
            <div className="w-14 h-[2px] bg-pn-cognac/80 mb-4" />

            <p className="text-sm sm:text-[15px] text-pn-espresso/90 font-sans leading-relaxed mb-6 max-w-md font-normal">
              Accesorios, indumentaria y objetos de cuero para una vida en el campo, hoy.
            </p>

            <div>
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2.5 bg-pn-marron hover:bg-pn-espresso text-white px-7 py-3 text-xs uppercase tracking-[0.2em] font-sans font-medium transition-all duration-200 rounded-[2px] shadow-sm group"
              >
                <span>COMPRAR AHORA</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Sello Institucional — Renderizado HTML nítido sobre fotografía limpia */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end items-start pr-2 xl:pr-6 pointer-events-none select-none">
            <div className="text-right text-pn-espresso/85">
              <span className="block font-sans font-bold text-xs tracking-[0.24em] uppercase">
                PAMPA
              </span>
              <span className="block font-sans font-bold text-xs tracking-[0.24em] uppercase mt-0.5">
                NOVUS
              </span>
              <div className="w-9 h-[1.5px] bg-pn-cognac/70 ml-auto my-2" />
              <span className="block text-[10px] font-sans tracking-[0.18em] uppercase text-pn-marron font-medium leading-relaxed">
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
