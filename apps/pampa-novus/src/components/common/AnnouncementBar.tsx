import React from 'react'

export function AnnouncementBar() {
  return (
    <div className="bg-pampa-950 text-pampa-200 text-xs tracking-widest uppercase py-2 px-4 text-center font-medium border-b border-pampa-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-[11px]">
        <span>✦ Envíos asegurados a todo el territorio argentino</span>
        <span className="hidden md:inline">|</span>
        <span className="hidden md:inline">Hasta 3 Cuotas Fijas con todas las tarjetas</span>
        <span className="hidden md:inline">|</span>
        <span className="hidden sm:inline">Auténtica Talabartería & Marroquinería Fina</span>
      </div>
    </div>
  )
}
