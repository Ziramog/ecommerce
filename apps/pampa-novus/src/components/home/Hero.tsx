import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroMediaBackground } from './HeroMediaBackground'

export function Hero() {
  return (
    <section className="relative h-auto min-h-[490px] sm:min-h-[490px] lg:h-[530px] xl:h-[560px] flex items-center overflow-hidden bg-[#2E1C12] border-b border-[#EFE8DE] py-14 sm:py-14 lg:py-0">
      {/* Secuencia cinematográfica continua: hero_video.mp4 -> hero_video2.mp4 -> foto master (10s) -> loop */}
      <HeroMediaBackground />

      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-8 xl:px-10 w-full">
        {/* Columna Izquierda Editorial — Espaciado amplio y jerarquía boutique */}
        <div className="max-w-md sm:max-w-lg lg:max-w-[480px] xl:max-w-[520px] py-4 sm:py-6">
          <span className="text-[11px] sm:text-xs lg:text-[13px] font-sans uppercase tracking-[0.24em] text-pn-arena sm:text-pn-cognac font-bold block mb-3 sm:mb-4 select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] sm:drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            TALABARTERÍA MERCADAL
          </span>

          <h1 className="font-serif tracking-[-0.015em] mb-4 sm:mb-5">
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] font-semibold leading-[1.04] text-white sm:text-pn-espresso drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] sm:drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Raíces ecuestres.
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] font-normal italic text-pn-arena sm:text-pn-marron leading-[1.04] mt-1 sm:mt-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] sm:drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Estilo contemporáneo.
            </span>
          </h1>

          {/* Línea divisoria artesanal */}
          <div className="w-12 h-[2px] bg-pn-arena sm:bg-pn-cognac/80 mb-4 sm:mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] sm:shadow-sm" />

          <p className="font-sans text-xs sm:text-sm lg:text-[15px] text-[#FAF7F2]/95 sm:text-pn-espresso/95 font-normal leading-relaxed mb-6 sm:mb-8 max-w-sm sm:max-w-md drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] sm:drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            Objetos de cuero y tradición criolla para una vida contemporánea.
          </p>

          <div>
            <Link
              href="/catalogo"
              className="inline-flex items-center space-x-3 bg-pn-marron hover:bg-pn-espresso text-white px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-[13px] uppercase tracking-[0.18em] font-sans font-semibold transition-all duration-300 rounded-[2px] border border-[#D9C9A8]/40 sm:border-transparent shadow-lg hover:shadow-xl group"
            >
              <span>COMPRAR AHORA</span>
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
