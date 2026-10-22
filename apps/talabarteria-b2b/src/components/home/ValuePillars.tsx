import React from 'react'
import { Truck, Package, ShieldCheck, MapPin } from 'lucide-react'

export function ValuePillars() {
  const pillars = [
    {
      icon: Truck,
      title: 'VENTA EXCLUSIVA A COMERCIOS',
      description: 'Condiciones especiales para el canal mayorista.',
    },
    {
      icon: Package,
      title: 'CATÁLOGO COMPLETO',
      description: 'Más de 20 rubros en talabartería.',
    },
    {
      icon: ShieldCheck,
      title: 'CALIDAD GARANTIZADA',
      description: 'Fabricación propia y tradición de confianza.',
    },
    {
      icon: MapPin,
      title: 'ENVÍOS A TODO EL PAÍS',
      description: 'Transporte propio y terceros. Logística segura.',
    },
  ]

  return (
    <section className="bg-white border-b border-[#E5E5E5] py-4 sm:py-5 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E5]">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className={`flex items-center gap-3.5 ${
                  idx > 0 ? 'pt-3 sm:pt-0 sm:pl-4 lg:pl-6' : ''
                }`}
              >
                <div className="w-9 h-9 flex items-center justify-center text-[#202020] flex-shrink-0">
                  <Icon className="w-5 h-5 stroke-[1.6]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#202020] leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-[11px] text-[#737373] leading-tight mt-0.5 font-normal">
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
