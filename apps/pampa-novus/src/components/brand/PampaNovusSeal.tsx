import React from 'react'
import { PampaNovusIcon } from './PampaNovusIcon'

interface PampaNovusSealProps {
  className?: string
  size?: number
  color?: string
}

export function PampaNovusSeal({
  className = 'w-24 h-24 text-pn-marron',
  size = 120,
  color = 'currentColor',
}: PampaNovusSealProps) {
  return (
    <div
      className={`relative rounded-full border-2 border-dashed border-current p-4 flex flex-col items-center justify-center text-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-1 rounded-full border border-current opacity-40 pointer-events-none" />
      <span className="text-[7px] font-sans font-bold tracking-[0.25em] uppercase leading-tight mb-1">
        PAMPA NOVUS
      </span>
      <PampaNovusIcon className="w-1/3 h-1/3 text-current my-0.5" />
      <span className="text-[6px] font-sans font-semibold tracking-[0.2em] uppercase leading-tight mt-1 opacity-80">
        TRADICIÓN QUE AVANZA
      </span>
    </div>
  )
}

export default PampaNovusSeal
