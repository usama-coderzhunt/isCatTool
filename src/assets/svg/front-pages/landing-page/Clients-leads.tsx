import type { SVGAttributes } from 'react'

const Clients = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='64' height='65' viewBox='0 0 64 65' fill='none' {...props}>
      {/* Background shape (optional, for consistency) */}
      <path
        opacity='0.1' // Lighter opacity
        d='M32 57.5C18.46 57.5 7.5 46.54 7.5 33C7.5 19.46 18.46 8.5 32 8.5C45.54 8.5 56.5 19.46 56.5 33C56.5 46.54 45.54 57.5 32 57.5Z'
        fill='currentColor'
      />
      {/* Central figure */}
      <path
        d='M32 41.5C36.4183 41.5 40 37.9183 40 33.5C40 29.0817 36.4183 25.5 32 25.5C27.5817 25.5 24 29.0817 24 33.5C24 37.9183 27.5817 41.5 32 41.5Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M42 51.5C42 46.798 37.5497 43 32 43C26.4503 43 22 46.798 22 51.5'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {/* Side figures (smaller) */}
      <path
        d='M18 49.5C18 46.186 20.6863 43.5 24 43.5C25.7993 43.5 27.4366 44.221 28.599 45.401' // Connect slightly behind main figure's shoulder line
        stroke='currentColor'
        strokeWidth='1.5' // Thinner stroke for side figures
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M24 38.5C26.2091 38.5 28 36.7091 28 34.5C28 32.2909 26.2091 30.5 24 30.5C21.7909 30.5 20 32.2909 20 34.5C20 36.7091 21.7909 38.5 24 38.5Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M46 49.5C46 46.186 43.3137 43.5 40 43.5C38.2007 43.5 36.5634 44.221 35.401 45.401' // Connect slightly behind main figure's shoulder line
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M40 38.5C42.2091 38.5 44 36.7091 44 34.5C44 32.2909 42.2091 30.5 40 30.5C37.7909 30.5 36 32.2909 36 34.5C36 36.7091 37.7909 38.5 40 38.5Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default Clients
