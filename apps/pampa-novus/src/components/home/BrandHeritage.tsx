import React from 'react'
import Image from 'next/image'
import { Award, Compass, Hammer } from 'lucide-react'

export function BrandHeritage() {
  return (
    <section id="herencia" className="py-24 bg-pampa-100/60 border-y border-pampa-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-leather font-semibold block mb-3">
            El Arte de la Talabartería
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-pampa-950 tracking-tight leading-tight mb-6">
            Tradición Criolla Forjada con Excelencia
          </h2>
          <p className="text-sm sm:text-base text-pampa-700 leading-relaxed">
            Pampa Novus nace del legado de los antiguos talleres talabarteros de la llanura argentina. Cada pieza une el curtido vegetal de primera selección con la destreza manual de artesanos que honran nuestras raíces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded border border-pampa-200 shadow-sm hover:shadow-luxury transition-all">
            <div className="w-12 h-12 bg-pampa-100 rounded-full flex items-center justify-center text-leather mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-pampa-950 mb-3">Cueros Nobres de Selección</h3>
            <p className="text-xs leading-relaxed text-pampa-600">
              Suela vacuna de curtición vegetal al tanino, cuero crudo sobado a mano y carpincho legítimo con textura inconfundible. Materiales que maduran con elegancia a lo largo de los años.
            </p>
          </div>

          <div className="bg-white p-8 rounded border border-pampa-200 shadow-sm hover:shadow-luxury transition-all">
            <div className="w-12 h-12 bg-pampa-100 rounded-full flex items-center justify-center text-leather mb-6">
              <Hammer className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-pampa-950 mb-3">Herrajes de Alpaca & Acero</h3>
            <p className="text-xs leading-relaxed text-pampa-600">
              Hebillas cinceladas, pasadores de alpaca criolla y estribos chaqueños de acero inoxidable. Cada metal es trabajado para resistir la intemperie y el paso de las generaciones.
            </p>
          </div>

          <div className="bg-white p-8 rounded border border-pampa-200 shadow-sm hover:shadow-luxury transition-all">
            <div className="w-12 h-12 bg-pampa-100 rounded-full flex items-center justify-center text-leather mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-pampa-950 mb-3">Diseño Funcional & Ecuestre</h3>
            <p className="text-xs leading-relaxed text-pampa-600">
              Aperos concebidos tanto para el trabajo de campo exigente como para la exhibición tradicional en desfiles y competencias de destreza criolla.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
