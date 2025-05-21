import { SVGAttributes } from 'react'

const ExcellenceIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 64 64' fill='none' {...props}>
      <g transform='scale(1.15) translate(-4.5, -4.5)'>
        {/* Trophy cup */}
        <path
          d='M24 18H40V28C40 34.6274 35.3137 40 32 40C28.6863 40 24 34.6274 24 28V18Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Trophy base */}
        <path
          d='M28 42H36V46H28V42Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Handles */}
        <path
          d='M24 22H18C18 26 20 30 24 30'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        <path
          d='M40 22H46C46 26 44 30 40 30'
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

export default ExcellenceIcon
