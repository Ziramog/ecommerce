import React from 'react'
import Image from 'next/image'

interface PampaNovusLogoProps {
  variant?: 'horizontal' | 'apilado' | 'isologo' | 'sello'
  theme?: 'dark' | 'white'
  className?: string
  height?: number
  priority?: boolean
}

/**
 * Pampa Novus Official Brand Logo
 * Source of truth: 00_LAMINA_IDENTIDAD_OFICIAL.png
 * Renders the official raster/vector assets extracted with full safety margins.
 */
export function PampaNovusLogo({
  variant = 'horizontal',
  theme = 'dark',
  className = '',
  height = 36,
  priority = false,
}: PampaNovusLogoProps) {
  const isWhite = theme === 'white'

  // Proportional aspect ratios based on master extractions
  switch (variant) {
    case 'horizontal': {
      // 324 x 106 => approx 3.05:1
      const src = isWhite
        ? '/brand/pampa-novus/pampa-novus-logo-horizontal-white.png'
        : '/brand/pampa-novus/pampa-novus-logo-horizontal.png'
      const width = Math.round(height * 3.05)
      return (
        <Image
          src={src}
          alt="Pampa Novus"
          width={width}
          height={height}
          priority={priority}
          className={`object-contain select-none ${className}`}
        />
      )
    }

    case 'apilado': {
      // 207 x 157 => approx 1.32:1
      const src = isWhite
        ? '/brand/pampa-novus/pampa-novus-logo-apilado-white.png'
        : '/brand/pampa-novus/pampa-novus-logo-apilado.png'
      const width = Math.round(height * 1.32)
      return (
        <Image
          src={src}
          alt="Pampa Novus — Tradición que avanza"
          width={width}
          height={height}
          priority={priority}
          className={`object-contain select-none ${className}`}
        />
      )
    }

    case 'isologo': {
      // 129 x 126 => approx 1:1
      const src = isWhite
        ? '/brand/pampa-novus/pampa-novus-isologo-white.png'
        : '/brand/pampa-novus/pampa-novus-isologo.png'
      return (
        <Image
          src={src}
          alt="Isologo Pampa Novus"
          width={height}
          height={height}
          priority={priority}
          className={`object-contain select-none ${className}`}
        />
      )
    }

    case 'sello': {
      // 185 x 173 => approx 1.07:1
      const src = isWhite
        ? '/brand/pampa-novus/pampa-novus-sello-white.png'
        : '/brand/pampa-novus/pampa-novus-sello.png'
      const width = Math.round(height * 1.07)
      return (
        <Image
          src={src}
          alt="Sello Oficial Pampa Novus"
          width={width}
          height={height}
          priority={priority}
          className={`object-contain select-none ${className}`}
        />
      )
    }

    default:
      return null
  }
}

export default PampaNovusLogo
