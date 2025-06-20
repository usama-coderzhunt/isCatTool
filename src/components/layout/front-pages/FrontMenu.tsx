'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Logo from '@components/layout/shared/Logo'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// Component Imports
import DropdownMenu from './DropdownMenu'
import { useTranslation } from 'react-i18next'

type Props = {
  mode: Mode
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
}

type WrapperProps = {
  children: React.ReactNode
  isBelowLgScreen: boolean
  className?: string
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
}

const Wrapper = (props: WrapperProps) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  // Props
  const { children, isBelowLgScreen, className, isDrawerOpen, setIsDrawerOpen } = props

  if (isBelowLgScreen) {
    return (
      <Drawer
        variant='temporary'
        anchor={currentLocale === 'ar' ? 'right' : 'left'}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        ModalProps={{
          keepMounted: true
        }}
        sx={{ '& .MuiDrawer-paper': { width: ['100%', 300], overflow: 'unset' } }}
        className={classnames('p-5', className)}
      >
        <div className='p-4 flex flex-col gap-x-6'>
          <div className='w-full flex items-center justify-between'>
            <Link
              href={`/${currentLocale}/home`}
              className={`${currentLocale === 'ar' ? 'ml-2' : ''}`}
              onClick={() => setIsDrawerOpen(false)}
            >
              <Logo />
            </Link>
            <IconButton
              onClick={() => setIsDrawerOpen(false)}
              className={`!w-8 !h-8 absolute top-4 ${currentLocale === 'ar' ? '-left-4' : '-right-4'} bg-primary text-white hover:bg-primary hover:text-white rounded-full z-[999]`}
            >
              <i className='tabler-x' />
            </IconButton>
          </div>
          <div className='flex flex-col gap-y-2 mt-6'>{children}</div>
        </div>
      </Drawer>
    )
  }

  return (
    <div className={classnames('flex items-center flex-wrap gap-x-4 gap-y-3 mr-[90px]', className)}>{children}</div>
  )
}

const FrontMenu = (props: Props) => {
  // Props
  const { isDrawerOpen, setIsDrawerOpen, mode } = props
  const { t, i18n } = useTranslation('global')
  // Hooks
  const pathname = usePathname()
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'))
  const { intersections } = useIntersection()

  const { lang } = useParams()
  const currentLocale = Array.isArray(lang) ? lang[0] : lang

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useEffect(() => {
    if (!isBelowLgScreen && isDrawerOpen) {
      setIsDrawerOpen(false)
    }
  }, [isBelowLgScreen])

  return (
    <Wrapper isBelowLgScreen={isBelowLgScreen} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}>
      <Typography
        color='text.primary'
        component={Link}
        href={`/${currentLocale}/home`}
        onClick={() => setIsDrawerOpen(false)}
        className={classnames(
          pathname === `/${currentLocale}/home`
            ? ''
            : `font-medium plb-2 pli-2 transition duration-300 ease-in-out ${isBelowLgScreen ? 'hover:bg-primaryLight hover:text-primary rounded-md' : 'hover:text-primary'}`,
          {
            [`font-medium plb-2 pli-2 ${isBelowLgScreen ? 'text-white bg-primary rounded-md' : 'text-primary'}`]:
              pathname === `/${currentLocale}/home`
          },
          currentLocale === 'ar' ? 'text-right' : 'text-left'
        )}
      >
        {t('frontMenu.home')}
      </Typography>
      <Typography
        color='text.primary'
        component={Link}
        href={`/${currentLocale}/about`}
        onClick={() => setIsDrawerOpen(false)}
        className={classnames(
          pathname === `/${currentLocale}/about`
            ? ''
            : `font-medium plb-2 pli-2 transition duration-300 ease-in-out ${isBelowLgScreen ? 'hover:bg-primaryLight hover:text-primary rounded-md' : 'hover:text-primary'}`,
          {
            [`font-medium plb-2 pli-2 ${isBelowLgScreen ? 'text-white bg-primary rounded-md' : 'text-primary'}`]:
              pathname === `/${currentLocale}/about`
          },
          currentLocale === 'ar' ? 'text-right' : 'text-left'
        )}
      >
        {t('frontMenu.about')}
      </Typography>
      <Typography
        color='text.primary'
        component={Link}
        href={`/${currentLocale}/services`}
        onClick={() => setIsDrawerOpen(false)}
        className={classnames(
          pathname === `/${currentLocale}/services`
            ? ''
            : `font-medium plb-2 pli-2 transition duration-300 ease-in-out ${isBelowLgScreen ? 'hover:bg-primaryLight hover:text-primary rounded-md' : 'hover:text-primary'}`,
          {
            [`font-medium plb-2 pli-2 ${isBelowLgScreen ? 'text-white bg-primary rounded-md' : 'text-primary'}`]:
              pathname === `/${currentLocale}/services`
          },
          currentLocale === 'ar' ? 'text-right' : 'text-left'
        )}
      >
        {t('frontMenu.services')}
      </Typography>
      <Typography
        color='text.primary'
        component={Link}
        href={`/${currentLocale}/blogs`}
        onClick={() => setIsDrawerOpen(false)}
        className={classnames(
          pathname === `/${currentLocale}/blogs`
            ? ''
            : `font-medium plb-2 pli-2 transition duration-300 ease-in-out ${isBelowLgScreen ? 'hover:bg-primaryLight hover:text-primary rounded-md' : 'hover:text-primary'}`,
          {
            [`font-medium plb-2 pli-2 ${isBelowLgScreen ? 'text-white bg-primary rounded-md' : 'text-primary'}`]:
              pathname === `/${currentLocale}/blogs`
          },
          currentLocale === 'ar' ? 'text-right' : 'text-left'
        )}
      >
        {t('frontMenu.blogs')}
      </Typography>
      <Typography
        component={Link}
        color='text.primary'
        href={`/${currentLocale}/contact`}
        onClick={() => setIsDrawerOpen(false)}
        className={classnames(
          pathname === `/${currentLocale}/contact`
            ? ''
            : `font-medium plb-2 pli-2 transition duration-300 ease-in-out ${isBelowLgScreen ? 'hover:bg-primaryLight hover:text-primary rounded-md' : 'hover:text-primary'}`,
          {
            [`font-medium plb-2 pli-2 ${isBelowLgScreen ? 'text-white bg-primary rounded-md' : 'text-primary'}`]:
              pathname === `/${currentLocale}/contact`
          },
          currentLocale === 'ar' ? 'text-right' : 'text-left'
        )}
      >
        {t('frontMenu.contact')}
      </Typography>
    </Wrapper>
  )
}

export default FrontMenu
