import React from 'react'

export function AnnouncementBar() {
  return (
    <div className="bg-pn-espresso text-pn-crema/90 text-[11px] sm:text-xs tracking-[0.14em] uppercase py-2 px-4 text-center font-medium border-b border-pn-marron/30 select-none">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-center gap-6">
        <span>✦ Envíos asegurados a todo el territorio argentino</span>
        <span className="hidden md:inline opacity-30">|</span>
        <span className="hidden md:inline">Hasta 3 Cuotas sin interés con tarjetas bancarias</span>
        <span className="hidden md:inline opacity-30">|</span>
        <span className="hidden sm:inline">Tradición que avanza · Calidad contemporánea</span>
      </div>
    </div>
  )
}

export default AnnouncementBar
