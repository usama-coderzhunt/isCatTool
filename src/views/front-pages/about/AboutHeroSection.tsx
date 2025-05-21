'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useColorScheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'

import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Styles Imports
import styles from '../landing-page/styles.module.css'
import frontCommonStyles from '@views/front-pages/styles.module.css'

const AboutHeroSection = ({ mode }: { mode: SystemMode }) => {
  const [transform, setTransform] = useState('')
  const { mode: muiMode } = useColorScheme()
  const _mode = (muiMode === 'system' ? mode : muiMode) || mode
  const isAboveLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  const heroSectionBgLight = '/images/front-pages/landing-page/hero-bg-light.png'
  const heroSectionBgDark = '/images/front-pages/landing-page/hero-bg-dark.png'
  const heroSectionBg = useImageVariant(mode, heroSectionBgLight, heroSectionBgDark)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  return (
    <section id='about-hero' className='relative plb-[100px] h-[60vh] flex items-center justify-center overflow-hidden'>
      <img
        src={heroSectionBg}
        className={classnames('absolute top-0 left-0 w-full h-full object-cover z-0', styles.heroSectionBg, {
          [styles.bgLight]: _mode === 'light',
          [styles.bgDark]: _mode === 'dark'
        })}
      />

      <div className={classnames('pbs-[88px] overflow-hidden', frontCommonStyles.layoutSpacing)}>
        <div className='md:max-is-[650px] mbs-0 mbe-7 mli-auto text-center relative'>
          <Typography
            className={classnames(
              'font-extrabold sm:text-[42px] text-3xl mbe-4 leading-[48px] text-white',
              styles.heroText
            )}
          >
            {t('about.Hero.heading')}
          </Typography>
          <Typography className='font-bold text-primary'>{t('about.Hero.subHeading')} </Typography>
          <div className='flex mbs-6 items-center justify-center gap-4 flex-wrap'>
            <Button variant='contained' color='primary' size='large' component={Link} href='/contact'>
              {t('about.Hero.contact Us')}{' '}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutHeroSection
