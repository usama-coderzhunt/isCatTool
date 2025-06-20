'use client'

import { useState } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { getLocalizedUrl } from '@/utils/i18n'

const LanguageSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { i18n } = useTranslation('global')

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' },
    { value: 'es', label: 'Español' }
  ]

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = window.location.pathname
    const pathWithoutLocale = currentPath.replace(`/${currentLocale}`, '')
    const newPath = `/${newLocale}${pathWithoutLocale || '/'}`
    i18n.changeLanguage(newLocale)
    localStorage.setItem('i18nextLng', newLocale)
    router.push(newPath)
    handleClose()
  }

  return (
    <>
      <i className='tabler-language cursor-pointer' onClick={handleClick} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {languages.map(lang => (
          <MenuItem
            key={lang.value}
            onClick={() => handleLanguageChange(lang.value)}
            selected={currentLocale === lang.value}
          >
            <Typography color='text.primary'>{lang.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSwitcher
