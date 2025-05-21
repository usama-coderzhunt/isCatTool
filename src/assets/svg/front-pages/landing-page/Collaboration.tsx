import { SVGAttributes } from 'react'

const CollaborationIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 64 64' fill='none' {...props}>
      <g transform='scale(1.15) translate(-4.5, -4.5)'>
        {/* Left hand */}
        <path
          d='M24 32L18 26C16.5 24.5 16.5 22 18 20.5L20 18.5C21.5 17 24 17 25.5 18.5L28 21'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Right hand */}
        <path
          d='M40 32L46 26C47.5 24.5 47.5 22 46 20.5L44 18.5C42.5 17 40 17 38.5 18.5L36 21'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Handshake */}
        <path
          d='M28 30L36 30L32 34L28 30Z'
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

export default CollaborationIcon
