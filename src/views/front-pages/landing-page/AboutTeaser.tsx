'use client'

import React from 'react'
import classnames from 'classnames'
import { Typography, Button, Chip, Grid, Card, CardContent } from '@mui/material'
import { useTranslation } from 'react-i18next'

// Styles
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from './styles.module.css'

const AboutUsTeaser = () => {
  const { t } = useTranslation('global')

  return (
    <section id='about-us' className='plb-[100px] bg-backgroundDefault'>
      <div className={classnames('flex flex-col gap-14', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col gap-y-4 items-center justify-center'>
          <Chip size='small' variant='tonal' color='primary' label={t('landingPage.aboutUsTeaser.label')} />
          <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
            <div className='flex items-center gap-x-2'></div>
            <Typography className='text-center'>{t('landingPage.aboutUsTeaser.subtitle')}</Typography>
          </div>
        </div>
        <div className='lg:pis-[38px]'>
          <Grid container spacing={6} justifyContent='center' alignItems='center'>
            <Grid item xs={12} md={8} lg={10}>
              <Card className='flex justify-center items-center max-w-[1900px] h-[200px]'>
                <CardContent className='flex flex-col gap-y-[6px] items-center justify-center'>
                  <Typography variant='h4' className='text-center'>
                    {t('landingPage.aboutUsTeaser.missionTitle').split(' ')[0]}{' '}
                    <span className='relative z-[1] font-extrabold'>
                      {t('landingPage.aboutUsTeaser.missionTitle').split(' ').slice(1).join(' ')}
                      <img
                        src='/images/front-pages/landing-page/bg-shape.png'
                        alt='bg-shape'
                        className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                      />
                    </span>
                  </Typography>
                  <Typography className='text-center'>{t('landingPage.aboutUsTeaser.missionDescription')}</Typography>
                  <Button variant='contained' href='/about-us' className='mt-4'>
                    {t('landingPage.aboutUsTeaser.learnMoreButton')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
    </section>
  )
}

export default AboutUsTeaser
