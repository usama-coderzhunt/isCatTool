import React from 'react'

const Loader = () => {
  return (
    <div className='flex items-center justify-center min-h-screen '>
      <div className='relative'>
        <div className='w-24 h-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin'>
          <div className='absolute inset-0 rounded-full border-4 border-purple-300 opacity-20'></div>
        </div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          <div className='w-16 h-16 bg-purple-600 rounded-full animate-pulse opacity-75 shadow-lg shadow-purple-500/50'></div>
        </div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          <div className='w-4 h-4 bg-white rounded-full shadow-md'></div>
        </div>
      </div>
      {/* <div className='ml-4 text-secondary text-2xl font-semibold'>
        <span className='mr-1 animate-pulse'>Loading</span>
        <span className='inline-block animate-pulse'>.</span>
        <span className='inline-block animate-pulse delay-100'>.</span>
        <span className='inline-block animate-pulse delay-200'>.</span>
      </div> */}
    </div>
  )
}

export default Loader
