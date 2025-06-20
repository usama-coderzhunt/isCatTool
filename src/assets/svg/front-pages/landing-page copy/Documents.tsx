import type { SVGAttributes } from 'react'

const Documents = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='64' height='65' viewBox='0 0 64 65' fill='none' {...props}>
      {/* Optional subtle background element */}
      <path
        opacity='0.1'
        d='M48 56.5H16C13.7909 56.5 12 54.7091 12 52.5V12.5C12 10.2909 13.7909 8.5 16 8.5H40L52 20.5V52.5C52 54.7091 50.2091 56.5 48 56.5Z'
        fill='currentColor'
      />
      {/* Main document shape */}
      <path
        d='M40 8.5H16C13.7909 8.5 12 10.2909 12 12.5V52.5C12 54.7091 13.7909 56.5 16 56.5H48C50.2091 56.5 52 54.7091 52 52.5V20.5L40 8.5Z' // Page outline
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M40 8.5V20.5H52' // Folded corner line
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {/* Lines representing text */}
      <path d='M44 32.5H20' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M44 40.5H20' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M32 48.5H20' // Shorter line
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default Documents
