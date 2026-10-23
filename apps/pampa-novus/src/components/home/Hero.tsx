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
          {/* Columna Izquierda: Bloque Editorial Titular y CTA con Máxima Jerarquía */}
          <div className="lg:col-span-7 xl:col-span-6 py-4">
            <span className="text-xs sm:text-[13px] font-sans uppercase tracking-[0.24em] text-pn-cognac font-bold block mb-3 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
              TALABARTERÍA MERCADAL
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[50px] xl:text-[56px] font-bold tracking-tight text-pn-espresso leading-[1.03] mb-4 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
              Raíces ecuestres.
              <span className="block font-medium italic text-pn-marron mt-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
                Estilo contemporáneo.
              </span>
            </h1>

            {/* Línea divisoria artesanal */}
            <div className="w-16 h-[2.5px] bg-pn-cognac mb-4 shadow-sm" />

            <p className="text-sm sm:text-base text-pn-espresso font-sans font-medium leading-relaxed mb-7 max-w-md drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Accesorios, indumentaria y objetos de cuero para una vida en el campo, hoy.
            </p>

            <div>
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-3 bg-pn-marron hover:bg-pn-espresso text-white px-8 py-3.5 text-xs sm:text-[13px] uppercase tracking-[0.2em] font-sans font-semibold transition-all duration-200 rounded-[2px] shadow-md hover:shadow-lg group"
              >
                <span>COMPRAR AHORA</span>
                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Sello Institucional — Protegido con resplandor sutil para nitidez absoluta */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end items-start pr-2 xl:pr-6 pointer-events-none select-none">
            <div className="text-right text-pn-espresso p-3.5 rounded-[2px] bg-[#FAF7F2]/65 backdrop-blur-[4px] border border-[#D9C9A8]/50 shadow-sm">
              <span className="block font-sans font-bold text-xs tracking-[0.26em] uppercase text-pn-espresso">
                PAMPA
              </span>
              <span className="block font-sans font-bold text-xs tracking-[0.26em] uppercase text-pn-espresso mt-0.5">
                NOVUS
              </span>
              <div className="w-10 h-[1.5px] bg-pn-cognac ml-auto my-2" />
              <span className="block text-[10.5px] font-sans tracking-[0.2em] uppercase text-pn-marron font-bold leading-relaxed">
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
