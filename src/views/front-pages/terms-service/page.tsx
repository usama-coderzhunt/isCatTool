'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import TermsOfService from './TermsofService'
import Footer from '../landing-page/Footer'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const TermsOfServiceWrapper = ({ mode }: { mode: SystemMode }) => {
  const { updatePageSettings } = useSettings()

  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='bg-backgroundPaper'>
      <TermsOfService mode={mode} />
      <Footer />
    </div>
  )
}

export default TermsOfServiceWrapper
