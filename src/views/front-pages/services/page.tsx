'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import ServicesHeroSection from './ServicesHeroSection'
import Footer from '../landing-page/Footer'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import Services from '@/app/[lang]/(dashboard)/(private)/apps/services/page'

const ServicesPageWrapper = ({ mode }: { mode: SystemMode }) => {
  // Hooks
  const { updatePageSettings } = useSettings()

  // // For Page specific settings
  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='bg-backgroundDefault'>
      <ServicesHeroSection mode={mode} />
      <Footer />
    </div>
  )
}

export default ServicesPageWrapper
