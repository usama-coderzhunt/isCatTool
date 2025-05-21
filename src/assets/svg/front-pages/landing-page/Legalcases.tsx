import type { SVGAttributes } from 'react'

const LegalCases = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='64'
      height='64'
      viewBox='0 0 64 64'
      fill='currentColor' // Changed from 'none' to fill the shapes
      {...props}
    >
      {/* Base and Stand */}
      <path d='M20 58 L44 58 L36 50 L36 18 L28 18 L28 50 L20 58 Z' />

      {/* Top Beam */}
      <path d='M10 22 Q 32 10 54 22 L 50 26 L 14 26 L 10 22 Z' />

      {/* Left Scale */}
      <g>
        {/* Pivot */}
        <circle cx='14' cy='26' r='3' />
        {/* Hanger Lines/Triangle */}
        <path d='M14 28 L14 34 L8 40 L20 40 L14 34' />
        {/* Pan */}
        <path d='M8 40 Q 14 50 20 40 Z' />
      </g>

      {/* Right Scale */}
      <g>
        {/* Pivot */}
        <circle cx='50' cy='26' r='3' />
        {/* Hanger Lines/Triangle */}
        <path d='M50 28 L50 34 L44 40 L56 40 L50 34' />
        {/* Pan */}
        <path d='M44 40 Q 50 50 56 40 Z' />
      </g>
    </svg>
  )
}

export default LegalCases
