const LoadingIndicator = () => {
  return (
    <div className='col-span-full flex justify-center py-4'>
      <div className='animate-pulse flex space-x-4'>
        <div className='h-4 w-4 bg-primary rounded-full'></div>
        <div className='h-4 w-4 bg-primary rounded-full'></div>
        <div className='h-4 w-4 bg-primary rounded-full'></div>
      </div>
    </div>
  )
}

export default LoadingIndicator
