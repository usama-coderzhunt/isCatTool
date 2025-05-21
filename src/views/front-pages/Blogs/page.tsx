'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import BlogsHeroSection from './BlogHeroSection'
import Footer from '../landing-page/Footer'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const BlogsPageWrapper = ({ mode }: { mode: SystemMode }) => {
  // Hooks
  const { updatePageSettings } = useSettings()

  // For Page specific settings
  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='bg-backgroundPaper'>
      <BlogsHeroSection mode={mode} />
      <Footer />
    </div>
  )
}

export default BlogsPageWrapper
