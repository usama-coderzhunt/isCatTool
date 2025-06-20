'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports

// Component Imports
import Contact from './Contact'
import Footer from '../landing-page/Footer'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ContactPageWrapper = ({ mode }: any) => {
  const { updatePageSettings } = useSettings()

  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='bg-backgroundPaper'>
      <Contact />
      <Footer />
    </div>
  )
}

export default ContactPageWrapper
