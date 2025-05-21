import { SVGAttributes } from 'react'

const InnovationIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 64 64' fill='none' {...props}>
      <g transform='scale(1.15) translate(-4.5, -4.5)'>
        {/* Lightbulb outline */}
        <path
          d='M32 8C23.716 8 17 14.716 17 23C17 27.731 19.507 31.891 23.306 34.197C24.46 34.895 25 36.204 25 37.568V40C25 41.657 26.343 43 28 43H36C37.657 43 39 41.657 39 40V37.568C39 36.204 39.54 34.895 40.694 34.197C44.493 31.891 47 27.731 47 23C47 14.716 40.284 8 32 8Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Bulb base */}
        <path
          d='M28 43V45C28 46.657 29.343 48 31 48H33C34.657 48 36 46.657 36 45V43'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Light rays */}
        <path
          d='M32 4V8M48 32H52M12 32H16M45.2548 18.7452L48.4853 15.5147M15.5147 15.5147L18.7452 18.7452'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  )
}

export default InnovationIcon
