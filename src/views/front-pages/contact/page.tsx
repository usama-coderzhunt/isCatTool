'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import Contact from './Contact'
import Footer from '../landing-page/Footer'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ContactPageWrapper = ({ mode }: { mode: SystemMode }) => {
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
