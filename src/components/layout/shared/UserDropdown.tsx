'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

// Type Imports
import Cookies from 'js-cookie'

import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useAuthStore } from '@/store/useAuthStore'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import ResetPasswordDialog from '@/components/dialogs/ResetPasswordDialog'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const userName = getDecryptedLocalStorage('userName')
  const userRole = getDecryptedLocalStorage('userRole')

  // States
  const [open, setOpen] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const { t, i18n } = useTranslation('global')
  const pathname = usePathname()
  const frontPageRoutes = [
    `/${locale}/`,
    `/${locale}/about`,
    `/${locale}/services`,
    `/${locale}/blogs`,
    `/${locale}/contact`,
    `/${locale}/service-details/[id]`
  ]
  useEffect(() => {
    i18n.changeLanguage(locale as string)
  }, [locale, i18n])

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale as Locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      if (!frontPageRoutes.some(route => pathname.startsWith(route))) {
        await signOut({ callbackUrl: `/${locale}/login` })
      }

      localStorage.clear()
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/')
      })
      console.log('LocalStorage, SessionStorage, and Cookies cleared!')
      if (frontPageRoutes.some(route => pathname.startsWith(route))) {
        window.location.reload()
      }
    } catch (error) {
      console.error(error)

      // Show above error in a toast like following
      // toastService.error((err as Error).message)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || ''}
          src={session?.user?.image || ''}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    <Avatar alt={userName || ''} src={session?.user?.image || ''} />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {userName || ''}
                      </Typography>
                      <Typography variant='caption'>{userRole || ''}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  {(userRole || userName) && (
                    <MenuItem className='mli-2 gap-3' onClick={() => setResetPasswordOpen(true)}>
                      <i className='tabler-key' />
                      <Typography color='text.primary'>{t('userDropdown.resetPassword')}</Typography>
                    </MenuItem>
                  )}
                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      {t('userDropdown.logout')}
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <ResetPasswordDialog open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)} />
    </>
  )
}

export default UserDropdown
