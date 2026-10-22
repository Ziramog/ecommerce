import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { PampaNovusLogo } from '@/components/brand/PampaNovusLogo'

export function BrandHeritage() {
  return (
    <section id="nuestra-historia" className="py-10 sm:py-14 bg-[#FAF7F2] border-t border-[#EFE8DE]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[2px] overflow-hidden border border-[#EFE8DE] shadow-subtle min-h-[270px] sm:min-h-[290px] lg:min-h-[310px]">
          {/* Bloque Izquierdo (4 cols): Maestría Artesanal & Manifiesto */}
          <div className="relative lg:col-span-4 min-h-[240px] lg:min-h-full flex items-center justify-between overflow-hidden bg-pn-espresso">
            {/* Fotografía limpia de las manos del artesano en la mitad izquierda */}
            <div className="absolute inset-y-0 left-0 w-[55%] overflow-hidden">
              <Image
                src="/images/home/story-artisan.jpg"
                alt="Maestros talabarteros cosiendo cuero a mano"
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover object-left select-none"
              />
              {/* Degradado hacia Espresso para fundir con la zona editorial */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pn-espresso/30 to-pn-espresso" />
            </div>

            {/* Manifiesto e Isologo en la zona derecha oscura */}
            <div className="relative z-10 w-full h-full flex items-center justify-end p-6 sm:p-7 space-x-4">
              <div className="text-right text-white/95 font-sans text-xs sm:text-[13px] tracking-[0.2em] uppercase space-y-1 font-light select-none">
                <span className="block">TRADICIÓN</span>
                <span className="block">ARTESANÍA</span>
                <span className="block">CAMPO</span>
                <span className="block">ESTILO</span>
                <span className="block font-semibold text-pn-crema">HOY</span>
              </div>
              <div className="border-l border-white/25 pl-3.5">
                <PampaNovusLogo variant="isologo" theme="white" height={38} />
              </div>
            </div>
          </div>

          {/* Bloque Central (5 cols): Declaración Editorial y CTA con Mayor Presencia */}
          <div className="lg:col-span-5 bg-[#F5EBDD] p-7 sm:p-9 flex flex-col justify-center border-t lg:border-t-0 lg:border-l lg:border-r border-[#EFE8DE]">
            <span className="text-xs uppercase tracking-[0.2em] text-pn-cognac font-sans font-medium block mb-2.5">
              NUESTRA HISTORIA
            </span>

            <h3 className="font-serif text-2xl sm:text-[28px] lg:text-[30px] font-bold text-pn-espresso tracking-tight leading-snug mb-3">
              Talabartería Mercadal, ahora más cerca de vos.
            </h3>

            <p className="text-sm sm:text-[14.5px] text-pn-espresso/85 font-sans leading-relaxed mb-6 font-normal">
              Pampa Novus es el canal minorista online de Talabartería Mercadal, una marca con décadas de tradición en la creación de productos ecuestres de la más alta calidad. Llevamos la autenticidad del campo argentino a tu vida cotidiana, con un estilo contemporáneo.
            </p>

            <div>
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.18em] font-sans font-medium text-pn-marron hover:text-pn-espresso border border-pn-marron/60 hover:border-pn-marron px-5 py-2.5 rounded-[2px] transition-all group"
              >
                <span>CONOCÉ MÁS</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bloque Derecho (3 cols): Retrato Equino & Sello de Marca Limpio */}
          <div className="relative lg:col-span-3 min-h-[220px] lg:min-h-full flex items-center justify-end overflow-hidden bg-[#FAF7F2] border-t lg:border-t-0 border-[#EFE8DE]">
            {/* Fotografía limpia del caballo criollo en la mitad izquierda */}
            <div className="absolute inset-y-0 left-0 w-[48%] overflow-hidden">
              <Image
                src="/images/home/story-horse.jpg"
                alt="Nobleza criolla y tradición ecuestre"
                fill
                sizes="(max-width: 1024px) 40vw, 15vw"
                className="object-cover object-left select-none"
              />
              {/* Degradado hacia fondo marfil para fundir con la zona editorial */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FAF7F2]/30 to-[#FAF7F2]" />
            </div>

            {/* Sello y texto en la zona derecha clara */}
            <div className="relative z-10 p-6 text-right select-none">
              <div className="mb-2 flex justify-end">
                <PampaNovusLogo variant="isologo" height={36} />
              </div>
              <div className="font-sans font-bold text-xs tracking-[0.22em] text-pn-espresso uppercase leading-none">
                PAMPA
              </div>
              <div className="font-sans font-bold text-xs tracking-[0.22em] text-pn-espresso uppercase leading-none mt-1 mb-2">
                NOVUS
              </div>
              <div className="w-9 h-[1.5px] bg-pn-cognac/70 ml-auto my-2" />
              <span className="block text-[10px] font-sans tracking-[0.18em] uppercase text-pn-marron font-medium leading-tight">
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
