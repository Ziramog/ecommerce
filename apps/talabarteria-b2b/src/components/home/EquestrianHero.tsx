import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, Store, Truck, ChevronRight, UserPlus } from 'lucide-react'

export function EquestrianHero() {
  return (
    <section className="relative bg-[#FAF8F5] overflow-hidden border-b border-[#E8E2D8]">
      {/* Background with dedicated polo equestrian video */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/home/hero.png"
          className="w-full h-full object-cover object-center"
        >
          <source src="/videos/hero_video.mp4" type="video/mp4" />
        </video>
        {/* Overlay ocupando estrictamente el 50% derecho */}
        <div className="absolute top-0 right-0 bottom-0 w-full lg:w-1/2 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent pointer-events-none hidden lg:block" />
        {/* Mobile overlay to ensure high readability on narrow viewports */}
        <div className="absolute inset-0 bg-[#FAF8F5]/80 lg:hidden pointer-events-none" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-14 lg:py-16 xl:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Mensaje y llamadas a la acción */}
          <div className="lg:col-span-7 xl:col-span-7 w-full max-w-2xl bg-[#FAF8F5]/90 lg:bg-[#FAF8F5]/85 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white/60 shadow-xs">
            {/* Eyebrow con línea fina sepia/cuero */}
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#8C7355] font-bold">
                Talabartería José Mercadal
              </span>
              <span className="w-10 sm:w-14 h-[1px] bg-[#B49272]/70 inline-block" />
            </div>

            {/* Título Principal Editorial */}
            <h1 className="font-serif text-[26px] sm:text-4xl md:text-5xl xl:text-[52px] font-bold text-[#1F1E1D] leading-[1.15] sm:leading-[1.12] tracking-tight mb-4 sm:mb-5">
              Catálogo mayorista<br />
              para talabartería,<br />
              <span className="italic font-normal text-[#873528]">polo, salto y turf.</span>
            </h1>

            {/* Bajada Descriptiva */}
            <p className="text-[#57534E] text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8 font-normal max-w-xl">
              Productos de tradición y calidad, pensados para comercios, veterinarias rurales y tiendas especializadas en el mundo ecuestre.
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/acceso"
                className="inline-flex items-center gap-2 bg-[#152D24] hover:bg-[#0D1F18] text-white px-5 sm:px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all group"
              >
                <UserPlus className="w-4 h-4 text-[#9AB3A1] group-hover:scale-110 transition-transform" />
                <span>Solicitar cuenta mayorista</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF8F5] text-[#1F1E1D] border border-[#D6CFC4] hover:border-[#A8A29E] px-5 sm:px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs transition-all group"
              >
                <span>Ver catálogo</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: 3 Bloques Informativos B2B */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-3 sm:gap-3.5 max-w-md lg:ml-auto w-full">
            {/* Bloque 1 */}
            <Link
              href="/acceso"
              className="bg-white/95 backdrop-blur-md border border-[#E8E2D8] hover:border-[#C4BAA9] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#EFEAE2] flex items-center justify-center text-[#873528] flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1F1E1D] leading-tight truncate">
                    Precios y stock solo para cuentas aprobadas
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6E6862] leading-tight mt-0.5 truncate">
                    Acceso a precios mayoristas y stock en tiempo real.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#873528] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            {/* Bloque 2 */}
            <Link
              href="/catalogo"
              className="bg-white/95 backdrop-blur-md border border-[#E8E2D8] hover:border-[#C4BAA9] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#EFEAE2] flex items-center justify-center text-[#873528] flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Store className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1F1E1D] leading-tight truncate">
                    Venta exclusiva a comercios
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6E6862] leading-tight mt-0.5 truncate">
                    Condiciones especiales para el canal mayorista.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#873528] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            {/* Bloque 3 */}
            <Link
              href="/cotizacion"
              className="bg-white/95 backdrop-blur-md border border-[#E8E2D8] hover:border-[#C4BAA9] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#EFEAE2] flex items-center justify-center text-[#873528] flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1F1E1D] leading-tight truncate">
                    Envíos a todo el país
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6E6862] leading-tight mt-0.5 truncate">
                    Transporte propio y terceros. Logística segura y confiable.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#873528] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
