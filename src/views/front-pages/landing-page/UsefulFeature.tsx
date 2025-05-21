'use client'

import { useEffect, useRef } from 'react'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'

// Icons
import Staff from '@/assets/svg/front-pages/landing-page/Staff'
import Permissions from '@/assets/svg/front-pages/landing-page/Permissions'
import LegalCases from '@/assets/svg/front-pages/landing-page/Legalcases'
import Clients from '@/assets/svg/front-pages/landing-page/Clients-leads'
import Documents from './Documents'
import Payments from '@/assets/svg/front-pages/landing-page/Payments'

// Styles and hooks
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { useIntersection } from '@/hooks/useIntersection'

const icons = [
  <Staff color='var(--mui-palette-primary-main)' />,
  <Permissions color='var(--mui-palette-primary-main)' />,
  <LegalCases color='var(--mui-palette-primary-main)' />,
  <Clients color='var(--mui-palette-primary-main)' />,
  <Documents color='var(--mui-palette-primary-main)' />,
  <Payments color='var(--mui-palette-primary-main)' />
]

type Feature = {
  title: string
  description: string
}

const UsefulFeature = () => {
  const { t } = useTranslation('global')
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false
          return
        }
        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )

    ref.current && observer.observe(ref.current)
  }, [updateIntersections])

  const features = t('landingPage.usefulFeature.features', { returnObjects: true }) as Feature[]

  return (
    <section id='features' ref={ref} className='bg-backgroundPaper'>
      <div className={classnames('flex flex-col gap-12 pbs-12 pbe-[100px]', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col gap-y-4 items-center justify-center'>
          <Chip size='small' variant='tonal' color='primary' label={t('landingPage.usefulFeature.label')} />
          <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
            <Typography color='text.primary' variant='h4' className='text-center'>
              <span className='relative z-[1] font-extrabold'>
                {t('landingPage.usefulFeature.title').split(' ').slice(0, 3).join(' ')}
                <img
                  src='/images/front-pages/landing-page/bg-shape.png'
                  alt='bg-shape'
                  className='absolute block-end-0 z-[1] bs-[40%] is-[125%] sm:is-[132%] -inline-start-[13%] sm:inline-start-[-19%] block-start-[17px]'
                />
              </span>{' '}
              {t('landingPage.usefulFeature.title').split(' ').slice(3).join(' ')}
            </Typography>
            <Typography className='text-center'>{t('landingPage.usefulFeature.subtitle')}</Typography>
          </div>
        </div>
        <div>
          <Grid container spacing={6}>
            {features.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                <div className='flex flex-col gap-2 justify-center items-center'>
                  {icons[index]}
                  <Typography className='mbs-2' variant='h5'>
                    {item.title}
                  </Typography>
                  <Typography className='max-is-[364px] text-center'>{item.description}</Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
    </section>
  )
}

export default UsefulFeature
