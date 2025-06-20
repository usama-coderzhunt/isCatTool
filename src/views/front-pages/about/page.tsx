'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports

// Component Imports
import AboutHeroSection from './AboutHeroSection'
import CompanyHistory from './CompanyHistory'
import MissionVision from './MissionVision'
import CoreValues from './CoreValues'
import TeamSection from './TeamSection'
import Footer from '../landing-page/Footer' // Reusing Footer from landing page

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const AboutPageWrapper = ({ mode }: any) => {
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
      <AboutHeroSection mode={mode} />
      <CompanyHistory mode={mode} />
      <MissionVision mode={mode} />
      <CoreValues mode={mode} />
      <TeamSection />
      <Footer />
    </div>
  )
}

export default AboutPageWrapper
