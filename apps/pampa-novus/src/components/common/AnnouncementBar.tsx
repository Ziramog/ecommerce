import React from 'react'

export function AnnouncementBar() {
  return (
    <div className="bg-pn-espresso text-pn-crema/85 text-[10px] tracking-[0.18em] uppercase py-1.5 px-4 text-center font-medium border-b border-pn-marron/25 select-none">
      <div className="max-w-[1360px] mx-auto flex items-center justify-center gap-6">
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
