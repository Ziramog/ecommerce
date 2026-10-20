import React from 'react'
import { Users2, BookOpen, Award, Truck } from 'lucide-react'

export function ValuePillars() {
  const pillars = [
    {
      icon: Users2,
      title: 'CUENTA MAYORISTA',
      description:
        'Solicitá tu cuenta y accedé a precios mayoristas, stock y condiciones comerciales.',
    },
    {
      icon: BookOpen,
      title: 'CATÁLOGO COMPLETO',
      description:
        'Más de 20 rubros en talabartería, artículos ecuestres y repuestos.',
    },
    {
      icon: Award,
      title: 'CALIDAD GARANTIZADA',
      description:
        'Materiales seleccionados, fabricación propia y tradición de confianza.',
    },
    {
      icon: Truck,
      title: 'ENVÍOS A TODO EL PAÍS',
      description:
        'Trabajamos con transporte propio y terceros. Logística segura y confiable.',
    },
  ]

  return (
    <section className="bg-white py-12 sm:py-14 border-b border-[#E8E2D8]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center text-[#1C3B2B] flex-shrink-0">
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1F1E1D] mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#6E6862] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
