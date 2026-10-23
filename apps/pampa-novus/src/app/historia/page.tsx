import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Award, Sparkles, Feather, AlertCircle } from 'lucide-react'
import { CLIENT_COMMERCIAL_CONFIG } from '@/config/client-commercial-config'

export const metadata = {
  title: 'Nuestra Historia | Pampa Novus',
  description:
    'El legado de la talabartería criolla y la consagración del lujo contemporáneo. Conozca el origen artesanal de Pampa Novus y Talabartería Mercadal.',
}

export default function HistoriaPage() {
  const { historyNarrative } = CLIENT_COMMERCIAL_CONFIG

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Retorno */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-pn-cognac hover:text-pn-espresso transition-colors font-medium"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Volver a la Tienda
          </Link>
        </div>

        {/* Encabezado Editorial */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-12 shadow-sm mb-10 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-pn-cognac font-semibold block mb-3">
            Herencia & Maestría Criolla
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pn-espresso mb-6 tracking-tight leading-tight">
            Raíces en la Pampa.
            <br />
            <span className="italic font-normal text-pn-cognac">Estilo Contemporáneo.</span>
          </h1>

          <div className="w-16 h-0.5 bg-pn-cognac mx-auto mb-6" />

          <p className="text-sm sm:text-base text-pn-espresso/80 max-w-2xl mx-auto font-light leading-relaxed">
            Pampa Novus nace del linaje centenario de <strong>Talabartería Mercadal</strong>. Una visión que honra la nobleza de la tierra argentina, fusionando la solidez de los aperos criollos con la sofisticación estética de la alta marroquinería internacional.
          </p>

          {/* Aviso de Gobernanza de Contenidos */}
          {historyNarrative.approvalStatus === 'PENDING_CLIENT_APPROVAL' && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/80 rounded-[2px] text-amber-900 text-xs font-light">
              <AlertCircle size={14} className="text-amber-700 flex-shrink-0" />
              <span>
                <strong>Nota de gobernanza:</strong> Reseña editorial en proceso de ratificación formal por los directivos de Talabartería Mercadal S.A.
              </span>
            </div>
          )}
        </div>

        {/* Sección 1: El Origen y el Oficio */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm mb-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-pn-cognac">
                Capítulo I · El Oficio del Cuero
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pn-espresso">
                El Tiempo en Cada Costura
              </h2>
              <p className="text-sm text-pn-espresso/85 font-light leading-relaxed">
                En nuestro taller no existen los atajos industriales. Cada pieza comienza con la rigurosa selección de cueros vacunos de primera flor, curtidos pacientemente al tanino vegetal en bateas con extracto de quebracho y corteza de mimosa.
              </p>
              <p className="text-sm text-pn-espresso/85 font-light leading-relaxed">
                Nuestros maestros artesanos dominan el corte a lezna y el cosido a dos agujas con hilo encerado, una técnica centenaria donde cada puntada traba a la anterior, garantizando que un apero o cinturón soporte décadas de uso intenso y gane pátina con los años.
              </p>
            </div>

            <div className="md:col-span-5 relative h-72 rounded-[2px] overflow-hidden border border-pn-arena/40">
              <Image
                src="/images/products/montura-completa-trabajo.jpg"
                alt="Montura de cuero artesanal en taller"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>
        </div>

        {/* Pilares de Marca */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 border border-[#EFE8DE] rounded-[3px] shadow-sm text-center">
            <div className="w-12 h-12 bg-pn-crema rounded-full flex items-center justify-center text-pn-cognac mx-auto mb-4 border border-pn-arena/50">
              <Award size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-pn-espresso mb-2">
              Autenticidad Criolla
            </h3>
            <p className="text-xs text-pn-espresso/75 font-light leading-relaxed">
              Respeto riguroso por las proporciones, trenzados de 8 y 12 cabos y técnicas tradicionales de la guarnicionería de campo.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#EFE8DE] rounded-[3px] shadow-sm text-center">
            <div className="w-12 h-12 bg-pn-crema rounded-full flex items-center justify-center text-pn-cognac mx-auto mb-4 border border-pn-arena/50">
              <Sparkles size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-pn-espresso mb-2">
              Platería de Autor
            </h3>
            <p className="text-xs text-pn-espresso/75 font-light leading-relaxed">
              Virolas, pasadores y cabos cincelados a golpe de martillo y buril por orfebres consagrados en alpaca maciza y plata 925.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#EFE8DE] rounded-[3px] shadow-sm text-center">
            <div className="w-12 h-12 bg-pn-crema rounded-full flex items-center justify-center text-pn-cognac mx-auto mb-4 border border-pn-arena/50">
              <Feather size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-pn-espresso mb-2">
              Lujo Sostenible
            </h3>
            <p className="text-xs text-pn-espresso/75 font-light leading-relaxed">
              Procesos de curtido vegetal libres de cromo y respeto absoluto por la vida y el bienestar del artesano nacional.
            </p>
          </div>
        </div>

        {/* Sección 2: La Consagración de Pampa Novus */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm mb-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 relative h-72 rounded-[2px] overflow-hidden border border-pn-arena/40 order-2 md:order-1">
              <Image
                src="/images/products/cinturon-carpincho-alpaca.jpg"
                alt="Detalle de cinturón de carpincho y alpaca cincelada"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>

            <div className="md:col-span-7 space-y-4 order-1 md:order-2">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-pn-cognac">
                Capítulo II · La Consagración
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pn-espresso">
                El Diálogo entre el Campo y la Ciudad
              </h2>
              <p className="text-sm text-pn-espresso/85 font-light leading-relaxed">
                Pampa Novus no busca reinventar la tradición, sino honrarla en su máxima expresión estética. La montura criolla, el bozal de tiento crudo o el cuchillo verijero son obras de arte utilitario que trascienden el corral y el puesto de estancia.
              </p>
              <p className="text-sm text-pn-espresso/85 font-light leading-relaxed">
                Nuestra colección retail acerca estas piezas únicas al amante del buen vivir, al coleccionista y al jinete exigente que valora lo imperecedero: el aroma a cuero legítimo, la frialdad de la plata pura y el orgullo de lo hecho en nuestra tierra.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Catálogo */}
        <div className="bg-pn-espresso text-pn-crema p-8 sm:p-10 rounded-[3px] text-center space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Descubra la Colección Oficial
          </h3>
          <p className="text-xs sm:text-sm text-pn-arena max-w-lg mx-auto font-light leading-relaxed">
            Explore nuestra selección de 14 piezas maestras disponibles con despacho asegurado a todo el país y garantía de origen.
          </p>
          <div className="pt-2">
            <Link
              href="/catalogo"
              className="inline-block bg-pn-crema text-pn-espresso hover:bg-white px-8 py-3 rounded-[2px] text-xs uppercase tracking-[0.16em] font-semibold transition-colors"
            >
              Explorar Catálogo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
