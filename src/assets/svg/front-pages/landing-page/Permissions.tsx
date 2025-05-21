import type { SVGAttributes } from 'react'

const Permissions = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none' {...props}>
      <path
        d='M50 14H14C11.7909 14 10 15.7909 10 18V54C10 56.2091 11.7909 58 14 58H50C52.2091 58 54 56.2091 54 54V18C54 15.7909 52.2091 14 50 14Z'
        stroke='currentColor'
        strokeWidth='4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='32' cy='30' r='10' stroke='currentColor' strokeWidth='4' />
      <path d='M32 40V46' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
    </svg>
  )
}

export default Permissions
