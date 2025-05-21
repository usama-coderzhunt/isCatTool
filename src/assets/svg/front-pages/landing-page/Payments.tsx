import type { SVGAttributes } from 'react'

const Payments = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='64' height='65' viewBox='0 0 64 65' fill='none' {...props}>
      {/* Optional subtle background element */}
      <path
        opacity='0.1'
        d='M48 56.5H16C11.5817 56.5 8 52.9183 8 48.5V16.5C8 12.0817 11.5817 8.5 16 8.5H48C52.4183 8.5 56 12.0817 56 16.5V48.5C56 52.9183 52.4183 56.5 48 56.5Z'
        fill='currentColor'
      />
      {/* Stack of coins */}
      {/* Bottom coin */}
      <path
        d='M48 48.5H16C13.7909 48.5 12 46.7091 12 44.5C12 42.2909 13.7909 40.5 16 40.5H48C50.2091 40.5 52 42.2909 52 44.5C52 46.7091 50.2091 48.5 48 48.5Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {/* Middle coins (slightly offset) */}
      <path
        d='M48 42.5H16C13.7909 42.5 12 40.7091 12 38.5C12 36.2909 13.7909 34.5 16 34.5H48C50.2091 34.5 52 36.2909 52 38.5C52 40.7091 50.2091 42.5 48 42.5Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M48 36.5H16C13.7909 36.5 12 34.7091 12 32.5C12 30.2909 13.7909 28.5 16 28.5H48C50.2091 28.5 52 30.2909 52 32.5C52 34.7091 50.2091 36.5 48 36.5Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {/* Top coin */}
      <path
        d='M48 30.5H16C13.7909 30.5 12 28.7091 12 26.5C12 24.2909 13.7909 22.5 16 22.5H48C50.2091 22.5 52 24.2909 52 26.5C52 28.7091 50.2091 30.5 48 30.5Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {/* Optional: small detail on top coin like a symbol? (e.g. a simple line or circle) */}
      <path
        d='M32 24.5V28.5' // Simple vertical line as generic symbol
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default Payments
