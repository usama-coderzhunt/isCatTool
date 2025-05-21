import { SVGAttributes } from 'react'

const CustomerFocusIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 64 64' fill='none' {...props}>
      <g transform='scale(1.15) translate(-4.5, -4.5)'>
        {/* Head */}
        <circle cx='32' cy='22' r='6' stroke='currentColor' strokeWidth='2' />

        {/* Shoulders */}
        <path
          d='M22 44C22 36 42 36 42 44V46H22V44Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* Target circle around head */}
        <circle cx='32' cy='22' r='14' stroke='currentColor' strokeWidth='2' opacity='0.3' />
      </g>
    </svg>
  )
}

export default CustomerFocusIcon
