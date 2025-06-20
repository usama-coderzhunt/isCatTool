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
import Payments from '@/assets/svg/front-pages/landing-page/Payments'
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Styles and hooks
import { useIntersection } from '@/hooks/useIntersection'
import Documents from '@/assets/svg/front-pages/landing-page copy/Documents'
import { ServiceTypes } from '@/types/services'
import { stripHtmlTags } from '@/utils/utility/stripeHtmlTags'
import Card from '@mui/material/Card'
import CircularLoader from '@/components/CircularLoader'

const ServiceFeaturesList = ({ serviceData, loading }: { serviceData: ServiceTypes; loading: boolean }) => {
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

  return (
    <section id='features' ref={ref} className='py-20'>
      <div className={classnames('', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col gap-y-4 items-center justify-center max-w-[60%] w-full mx-auto'>
          <Chip size='small' variant='tonal' color='primary' label={t('services.serviceFeatures')} />
          {loading ? (
            <div className='flex items-center justify-center h-full mt-10'>
              <CircularLoader size={40} />
            </div>
          ) : !serviceData ? (
            <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
              <Typography color='text.primary' variant='h4' className='text-center'>
                {t('services.noFeaturesFound')}
              </Typography>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
              <Typography color='text.primary' variant='h4' className='text-center'>
                <span className='relative z-[1] font-extrabold'>
                  {serviceData?.name}
                  <img
                    src='/images/front-pages/landing-page/bg-shape.png'
                    alt='bg-shape'
                    className='absolute block-end-0 z-[1] bs-[40%] is-[125%] sm:is-[132%] -inline-start-[13%] sm:inline-start-[-19%] block-start-[17px]'
                  />
                </span>{' '}
              </Typography>
              <Typography className='text-center'>{stripHtmlTags(serviceData?.short_description)}</Typography>
            </div>
          )}
        </div>
        <div className='mt-10'>
          {!loading && (
            <>
              {serviceData?.features_list && Object.keys(serviceData.features_list).length > 0 && (
                <Grid container spacing={6}>
                  {Object.entries(serviceData.features_list).map(([key, value], index) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={key}>
                      <Card className='flex flex-col gap-4 justify-center items-center p-8 rounded-x shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group'>
                        <div className='p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300'>
                          <img
                            src='/images/front-pages/features-common-icon.png'
                            alt='feature icon'
                            className='w-16 h-16 object-contain'
                          />
                        </div>
                        <Typography
                          className='font-semibold text-xl text-primary/80 group-hover:text-primary transition-colors duration-300 capitalize'
                          variant='h5'
                        >
                          {key}
                        </Typography>
                        <Typography className='text-center text-secondaryLight group-hover:text-secondary transition-colors duration-300'>
                          {value}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default ServiceFeaturesList
