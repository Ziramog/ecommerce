import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { PampaNovusLogo } from '@/components/brand/PampaNovusLogo'

export function BrandHeritage() {
  return (
    <section id="nuestra-historia" className="py-8 sm:py-10 bg-[#FAF7F2] border-t border-[#EFE8DE]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[2px] overflow-hidden border border-[#EFE8DE] shadow-subtle">
          {/* Bloque Izquierdo (4 cols): Maestría Artesanal & Manifiesto */}
          <div className="relative lg:col-span-4 min-h-[220px] sm:min-h-[260px] flex items-center justify-between overflow-hidden bg-pn-espresso">
            <Image
              src="/images/home/story-artisan.jpg"
              alt="Maestros talabarteros cosiendo cuero a mano"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover object-left select-none"
            />
            {/* Degradado oscuro para asegurar contraste editorial */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/45 to-black/85" />

            {/* Manifiesto e Isologo */}
            <div className="relative z-10 w-full h-full flex items-center justify-end p-6 sm:p-7 space-x-5">
              <div className="text-right text-white/95 font-sans text-[11px] sm:text-xs tracking-[0.24em] uppercase space-y-1 font-light select-none">
                <span className="block">TRADICIÓN</span>
                <span className="block">ARTESANÍA</span>
                <span className="block">CAMPO</span>
                <span className="block">ESTILO</span>
                <span className="block font-semibold text-pn-crema">HOY</span>
              </div>
              <div className="border-l border-white/20 pl-3.5">
                <PampaNovusLogo variant="isologo" theme="white" height={36} />
              </div>
            </div>
          </div>

          {/* Bloque Central (5 cols): Declaración Editorial y CTA */}
          <div className="lg:col-span-5 bg-[#F5EBDD] p-6 sm:p-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l lg:border-r border-[#EFE8DE]">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-pn-cognac font-sans font-medium block mb-2">
              NUESTRA HISTORIA
            </span>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-pn-espresso tracking-tight leading-tight mb-2.5">
              Talabartería Mercadal, ahora más cerca de vos.
            </h3>

            <p className="text-xs sm:text-[13px] text-pn-espresso/85 font-sans leading-relaxed mb-5 font-light">
              Pampa Novus es el canal minorista online de Talabartería Mercadal, una marca con décadas de tradición en la creación de productos ecuestres de la más alta calidad. Llevamos la autenticidad del campo argentino a tu vida cotidiana, con un estilo contemporáneo.
            </p>

            <div>
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.18em] font-sans font-medium text-pn-marron hover:text-pn-espresso border border-pn-marron/50 hover:border-pn-marron px-4 py-2 rounded-[2px] transition-all group"
              >
                <span>CONOCÉ MÁS</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bloque Derecho (3 cols): Retrato Equino & Sello de Marca */}
          <div className="relative lg:col-span-3 min-h-[200px] sm:min-h-[260px] flex items-center justify-end overflow-hidden bg-pn-crema border-t lg:border-t-0 border-[#EFE8DE]">
            <Image
              src="/images/home/story-horse.jpg"
              alt="Nobleza criolla y tradición ecuestre"
              fill
              sizes="(max-width: 1024px) 100vw, 25vw"
              className="object-cover object-left select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FAF7F2]/30 to-[#FAF7F2]/90" />

            <div className="relative z-10 p-5 text-right select-none">
              <div className="mb-2 flex justify-end">
                <PampaNovusLogo variant="isologo" height={32} />
              </div>
              <div className="font-sans font-bold text-xs tracking-[0.2em] text-pn-espresso uppercase leading-none">
                PAMPA
              </div>
              <div className="font-sans font-bold text-xs tracking-[0.2em] text-pn-espresso uppercase leading-none mt-0.5 mb-2">
                NOVUS
              </div>
              <div className="w-8 h-[1px] bg-pn-cognac/60 ml-auto my-2" />
              <span className="block text-[9px] font-sans tracking-[0.2em] uppercase text-pn-marron font-medium leading-tight">
                MISMAS RAÍCES.<br />
                NUEVOS HORIZONTES.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandHeritage
