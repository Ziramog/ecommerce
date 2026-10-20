import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-pampa-950 text-white overflow-hidden">
      {/* Background with luxury leather texture / artisanal craftsman ambiance */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=2000&q=85"
          alt="Talabartería Criolla Tradicional"
          fill
          priority
          className="object-cover object-center opacity-30 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pampa-950 via-pampa-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-pampa-950 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-pampa-900/80 border border-pampa-700/60 backdrop-blur-md px-3.5 py-1.5 rounded-full mb-6 text-xs tracking-[0.2em] uppercase text-pampa-200 font-medium">
            <Sparkles size={13} className="text-brass-light" />
            <span>Colección Minorista Exclusiva</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
            Herencia, Cuero & <span className="italic font-normal text-pampa-200">Lujo Criollo</span>
          </h1>

          <p className="text-base sm:text-lg text-pampa-300 font-sans leading-relaxed mb-10 max-w-xl font-light">
            La máxima expresión de la talabartería argentina. Monturas de trabajo en suela seleccionada, cinturones de carpincho legítimo y platería criolla cincelada a mano para los amantes de la tradición ecuestre.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center space-x-3 bg-leather hover:bg-leather-light text-white px-8 py-4 text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-200 shadow-luxury rounded-sm group"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#herencia"
              className="inline-flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-pampa-200 border border-pampa-700/80 px-8 py-4 text-xs uppercase tracking-[0.22em] font-medium transition-colors rounded-sm backdrop-blur-sm"
            >
              <span>Nuestra Herencia</span>
            </Link>
          </div>

          <div className="mt-14 pt-8 border-t border-pampa-800/80 grid grid-cols-3 gap-6 text-left">
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-bold text-white">100%</span>
              <span className="text-[11px] text-pampa-400 uppercase tracking-wider">Cuero Seleccionado</span>
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-bold text-white">Maestros</span>
              <span className="text-[11px] text-pampa-400 uppercase tracking-wider">Talabarteros Reales</span>
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-bold text-white">Argentina</span>
              <span className="text-[11px] text-pampa-400 uppercase tracking-wider">Origen Federal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
