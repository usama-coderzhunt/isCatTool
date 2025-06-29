'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports

// Component Imports
import HeroSection from './HeroSection'
import UsefulFeature from './UsefulFeature'
import CustomerReviews from './CustomerReviews'
import OurTeam from './OurTeam'
import Pricing from './Pricing'
import ProductStat from './ProductStat'
import Faqs from './Faqs'
import GetStarted from './GetStarted'
import ContactUs from './ContactUs'
import { useSettings } from '@core/hooks/useSettings'
import AboutUsTeaser from './AboutTeaser'
import Footer from './Footer'

const LandingPageWrapper = ({ mode }: any) => {
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
      <HeroSection mode={mode} />
      <UsefulFeature />
      <AboutUsTeaser />
      <CustomerReviews />
      <OurTeam />
      <Pricing />
      <ProductStat />
      <Faqs />
      <GetStarted mode={mode} />
      <ContactUs />
      <Footer />
    </div>
  )
}

export default LandingPageWrapper
