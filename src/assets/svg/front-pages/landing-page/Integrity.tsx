import { SVGAttributes } from 'react'

const IntegrityIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 64 64' fill='none' {...props}>
      <g transform='scale(1.15) translate(-4.5, -4.5)'>
        {/* Shield shape */}
        <path
          d='M32 8L16 16V28C16 41.25 23.375 52 32 56C40.625 52 48 41.25 48 28V16L32 8Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Checkmark inside shield */}
        <path
          d='M24 32L30 38L42 26'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
      </g>
    </svg>
  )
}

export default IntegrityIcon
