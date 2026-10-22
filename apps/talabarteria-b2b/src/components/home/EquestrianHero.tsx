import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function EquestrianHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#18261E] border-b border-[#E5E5E5]">
      {/* Background Video Full Width con video ecuestre oficial */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/home/hero-polo-action.jpg"
          className="w-full h-full object-cover object-right lg:object-center"
        >
          <source src="/videos/hero_video.mp4" type="video/mp4" />
        </video>
        {/* Degradado lateral sutil: oscuro a la izquierda para contraste tipográfico, transparente a la derecha para ver el video */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 via-45% to-transparent pointer-events-none" />
      </div>

      {/* Contenido Principal sobre el Video */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-14 sm:py-20 lg:py-24 xl:py-28 min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#D4D4D4] font-bold block mb-3">
            Talabartería Mercadal · Canal Mayorista
          </span>

          {/* Título Principal Editorial */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.12] mb-4">
            Tradición ecuestre.<br />
            <span className="text-[#C86D51] font-normal italic">
              Calidad para tu negocio.
            </span>
          </h1>

          {/* Bajada Descriptiva */}
          <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed mb-8 max-w-xl font-normal">
            Equipamiento, talabartería y accesorios para comercios, veterinarias y profesionales del mundo ecuestre.
          </p>

          {/* Acciones Comerciales (Radio estricto 4px, sin botones pill) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-[#873427] hover:bg-[#6D271D] text-white px-5 sm:px-6 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-xs group"
            >
              <span>Explorar catálogo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/acceso"
              className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/80 px-5 sm:px-6 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Solicitar cuenta</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
