'use client'
import { SystemMode } from '@/@core/types'
import TermsOfServiceWrapper from '@/views/front-pages/terms-service/page'

const TermsOfServicePage = ({ mode }: { mode: SystemMode }) => {
  return <TermsOfServiceWrapper mode={mode} />
}

export default TermsOfServicePage
