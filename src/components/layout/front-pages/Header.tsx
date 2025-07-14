'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { useParams } from 'next/navigation'

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import { useTranslation } from 'react-i18next'

import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import FrontMenu from './FrontMenu'
import CustomIconButton from '@core/components/mui/IconButton'

// Util Imports
import { frontLayoutClasses } from '@layouts/utils/layoutClasses'

// Styles Imports
import styles from './styles.module.css'
import LanguageDropdown from '../shared/LanguageDropdown'
import UserDropdown from '../shared/UserDropdown'

const Header = ({ mode, isMenuVisible = false }: { mode: Mode; isMenuVisible?: boolean }) => {
  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const isLoggedIn = localStorage.getItem('userID')

  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  // Hooks
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'))

  // Detect window scroll
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  })

  return (
    <header className={classnames(frontLayoutClasses.header, styles.header)}>
      <div className={classnames(frontLayoutClasses.navbar, styles.navbar, { [styles.headerScrolled]: trigger })}>
        <div className={classnames(frontLayoutClasses.navbarContent, styles.navbarContent)}>
          {isBelowLgScreen ? (
            <div className='flex items-center gap-2 sm:gap-4'>
              {!isMenuVisible && (
                <IconButton onClick={() => setIsDrawerOpen(true)} className='-mis-2'>
                  <i className='tabler-menu-2 text-textPrimary' />
                </IconButton>
              )}
              <Link href={`/${currentLocale}/`}>
                <Logo />
              </Link>
              {!isMenuVisible && (
                <FrontMenu mode={mode} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
              )}
            </div>
          ) : (
            <div className='w-full flex items-center justify-between gap-4'>
              <Link href={`/${currentLocale}/`}>
                <Logo />
              </Link>
              {!isMenuVisible && (
                <FrontMenu mode={mode} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
              )}
            </div>
          )}
          <div className='flex items-center gap-2 sm:gap-4'>
            <ModeDropdown />
            <LanguageDropdown />
            {!isMenuVisible && (
              <>
                {!isLoggedIn || isLoggedIn === null ? (
                  <Button
                    component={Link}
                    variant='contained'
                    href={`/${currentLocale}/login`}
                    className='whitespace-nowrap'
                  >
                    {t('frontMenu.button.login')}
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    variant='contained'
                    href={`/${currentLocale}/dashboard`}
                    className='whitespace-nowrap'
                  >
                    {t('frontMenu.button.openApp')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
