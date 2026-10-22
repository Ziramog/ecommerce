import React from 'react'

interface PampaNovusIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  size?: number | string
  color?: string
}

/**
 * Pampa Novus Monogram Icon
 * Vector representation of the brand's interlocking leather cross knot,
 * symbolizing union, land and new horizons ("Símbolo de unión, tierra y nuevos horizontes").
 */
export function PampaNovusIcon({
  className = 'w-8 h-8 text-pn-marron',
  size,
  color = 'currentColor',
  ...props
}: PampaNovusIconProps) {
  return (
    <svg
      viewBox="0 0 150 150"
      fill={color}
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pampa Novus Monograma"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="
          M 22 0
          L 60 0
          L 60 40
          L 90 40
          L 90 0
          L 128 0
          L 150 22
          L 150 60
          L 110 60
          L 110 90
          L 150 90
          L 150 128
          L 128 150
          L 90 150
          L 90 110
          L 60 110
          L 60 150
          L 22 150
          L 0 128
          L 0 90
          L 40 90
          L 40 60
          L 0 60
          L 0 22
          Z
          M 26 20
          L 40 20
          L 40 40
          L 20 40
          L 20 26
          Z
          M 110 20
          L 124 20
          L 130 26
          L 130 40
          L 110 40
          Z
          M 110 110
          L 130 110
          L 130 124
          L 124 130
          L 110 130
          Z
          M 20 110
          L 40 110
          L 40 130
          L 26 130
          L 20 124
          Z
          M 60 60
          L 90 60
          L 90 90
          L 60 90
          Z
        "
      />
    </svg>
  )
}

export default PampaNovusIcon
