'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import PrivacyHeroSection from './PrivacyHeroSection'
import Footer from '../landing-page/Footer' // Reusing Footer from landing page

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const PrivacyPolicyWrapper = ({ mode }: { mode: SystemMode }) => {
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
      <PrivacyHeroSection mode={mode} />
      <Footer />
    </div>
  )
}

export default PrivacyPolicyWrapper
