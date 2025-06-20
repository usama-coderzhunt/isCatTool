import { SVGAttributes } from 'react'

const SustainabilityIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 64 64' fill='none' {...props}>
      <g transform='scale(1.15) translate(-4.5, -4.5)'>
        {/* Hand outline */}
        <path
          d='M20 40C22 42 26 42 30 40C32 39 35 38 38 38C41 38 44 39 44 42C44 45 40 48 36 48H28C24 48 20 44 20 40Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* Leaf above hand */}
        <path
          d='M32 24C32 20 34 16 38 16C42 16 44 20 44 24C44 28 42 32 38 32C34 32 32 28 32 24Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* Leaf vein */}
        <path d='M38 16L38 32' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
      </g>
    </svg>
  )
}

export default SustainabilityIcon
