import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, FileCheck2, Truck } from 'lucide-react'

export function EquestrianHero() {
  return (
    <section className="relative bg-[#FAF8F5] overflow-hidden border-b border-[#E8E2D8]">
      {/* Background with subtle equestrian photography overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=2000&q=85"
          alt="Talabartería ecuestre polo y salto"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Columna Izquierda: Mensaje y llamadas a la acción */}
          <div className="lg:col-span-7 xl:col-span-8">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8C7355] font-bold block mb-3">
              Talabartería Mercadal
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#1F1E1D] leading-[1.12] tracking-tight mb-5">
              Catálogo mayorista para talabartería,{' '}
              <span className="italic font-normal text-[#6B3A2A]">polo, salto y turf.</span>
            </h1>

            <p className="text-[#57534E] text-sm sm:text-base leading-relaxed mb-8 max-w-xl font-normal">
              Productos de tradición y calidad, pensados para comercios, veterinarias rurales y tiendas especializadas en el mundo ecuestre.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/acceso"
                className="inline-flex items-center gap-2.5 bg-[#1C3B2B] hover:bg-[#14291E] text-white px-7 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold shadow-md transition-all group"
              >
                <span>Solicitar cuenta mayorista</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-[#1F1E1D] border border-[#D6CFC4] hover:border-[#A8A29E] px-7 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold backdrop-blur-sm transition-all"
              >
                <span>Ver catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: 3 Tarjetas Flotantes de Beneficios B2B */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3.5">
            {/* Card 1 */}
            <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E8E2D8] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#6B3A2A] flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1F1E1D] leading-tight">
                  Precios y stock solo para cuentas aprobadas
                </h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E8E2D8] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#6B3A2A] flex-shrink-0 mt-0.5">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1F1E1D] leading-tight mb-1">
                  Venta exclusiva a comercios
                </h3>
                <p className="text-[11px] text-[#6E6862] leading-snug">
                  Condiciones especiales para el canal mayorista.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E8E2D8] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#6B3A2A] flex-shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1F1E1D] leading-tight mb-1">
                  Envíos a todo el país
                </h3>
                <p className="text-[11px] text-[#6E6862] leading-snug">
                  Transporte propio y terceros. Logística segura y confiable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
