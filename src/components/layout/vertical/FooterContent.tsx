'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
const FooterContent = () => {
  // Hooks
  const { useFooterSettings } = useAdminSettingsHook()
  const { data: footerSettings } = useFooterSettings()
  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-center flex-wrap gap-4')}
    >
      <p>{footerSettings?.copyright_text}</p>
    </div>
  )
}

export default FooterContent
