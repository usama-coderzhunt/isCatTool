'use client'

import { SystemMode } from '@/@core/types'
import ContactPageWrapper from '@/views/front-pages/contact/page'

const ContactPage = ({ mode }: { mode: SystemMode }) => {
  return <ContactPageWrapper mode={mode} />
}

export default ContactPage
