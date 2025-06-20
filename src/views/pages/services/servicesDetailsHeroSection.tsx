import { useEffect, useState } from 'react'
import { Button, Theme, Typography, useColorScheme } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import Link from 'next/link'
import classnames from 'classnames'
import { useImageVariant } from '@/@core/hooks/useImageVariant'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import styles from '../../front-pages/landing-page/styles.module.css'
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { SystemMode } from '@/@core/types'
import { ServiceTypes } from '@/types/services'
import { stripHtmlTags } from '@/utils/utility/stripeHtmlTags'
import CircularLoader from '@/components/CircularLoader'

const ServiceDetailsHeroSection = ({
  mode,
  serviceData,
  loading
}: {
  mode: SystemMode
  serviceData: ServiceTypes
  loading: boolean
}) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const [transform, setTransform] = useState('')

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  // Theme and styling
  const { mode: muiMode } = useColorScheme()
  const _mode = (muiMode === 'system' ? mode : muiMode) || mode

  // Background images
  const heroSectionBgLight = '/images/front-pages/landing-page/hero-bg-light.png'
  const heroSectionBgDark = '/images/front-pages/landing-page/hero-bg-dark.png'
  const dashboardImageLight = '/images/front-pages/landing-page/hero-dashboard-light2.png'
  const dashboardImageDark = '/images/front-pages/landing-page/hero-dashboard-dark2.png'
  const elementsImageLight = '/images/front-pages/landing-page/hero-elements-light.png'
  const elementsImageDark = '/images/front-pages/landing-page/hero-elements-dark.png'

  const heroSectionBg = useImageVariant(mode, heroSectionBgLight, heroSectionBgDark)
  const dashboardImage = useImageVariant(mode, dashboardImageLight, dashboardImageDark)
  const elementsImage = useImageVariant(mode, elementsImageLight, elementsImageDark)

  const isAboveLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleMouseMove = (event: MouseEvent) => {
        const rotateX = (window.innerHeight - 2 * event.clientY) / 100
        const rotateY = (window.innerWidth - 2 * event.clientX) / 100

        setTransform(
          `perspective(1200px) rotateX(${rotateX < -40 ? -20 : rotateX}deg) rotateY(${rotateY}deg) scale3d(1,1,1)`
        )
      }
      window.addEventListener('mousemove', handleMouseMove)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  return (
    <section id='home' className='overflow-hidden pbs-[75px] -mbs-[75px] relative'>
      <img
        src={heroSectionBg}
        alt='hero-bg'
        className={classnames('bs-[95%] sm:bs-[85%] md:bs-[80%]', styles.heroSectionBg, {
          [styles.bgLight]: _mode === 'light',
          [styles.bgDark]: _mode === 'dark'
        })}
      />
      <div className={classnames('pbs-[88px] overflow-hidden', frontCommonStyles.layoutSpacing)}>
        {loading ? (
          <div className='flex items-center justify-center h-full'>
            <CircularLoader size={40} />
          </div>
        ) : !serviceData ? (
          <div className='md:max-is-[650px] mbs-0 mbe-7 mli-auto text-center relative'>
            <Typography
              className={classnames(
                'font-extrabold sm:text-[42px] text-3xl mbe-4 leading-[48px] text-white',
                styles.heroText
              )}
            >
              {t('services.noServiceDataFound')}
            </Typography>
          </div>
        ) : (
          <div className='md:max-is-[650px] mbs-0 mbe-7 mli-auto text-center relative'>
            <Typography
              className={classnames(
                'font-extrabold sm:text-[42px] text-3xl mbe-4 leading-[48px] text-white',
                styles.heroText
              )}
            >
              {serviceData?.name}
            </Typography>
            <Typography className='font-bold text-primary'>
              {serviceData?.short_description ? stripHtmlTags(serviceData.short_description) : ''}
            </Typography>
          </div>
        )}
        <div className='flex my-6 items-center justify-center gap-4 flex-wrap'>
          <Button variant='contained' color='primary' size='large' component={Link} href={`/${currentLocale}/services`}>
            {t('services.backToServices')}
          </Button>
        </div>
      </div>
      <div
        className={classnames('relative text-center mt-6', frontCommonStyles.layoutSpacing)}
        style={{ transform: isAboveLgScreen ? transform : 'none' }}
      >
        <Link href='/' target='_blank' className='block relative'>
          <img
            src={serviceData?.image}
            alt='dashboard-image'
            className={classnames('mli-auto', styles.heroSecDashboard)}
          />
          {/* <div className={classnames('absolute', styles.heroSectionElements)}>
            <img src={elementsImage} alt='dashboard-elements' />
          </div> */}
        </Link>
      </div>
    </section>
  )
}

export default ServiceDetailsHeroSection
