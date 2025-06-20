// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ThemeColor } from '@core/types'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from '../landing-page/styles.module.css'
// i18n
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'

const Card = styled('div')`
  border-color: ${(props: { color: ThemeColor }) => props.color};
  border-start-start-radius: 90px;
  border-start-end-radius: 20px;
  border-end-start-radius: 6px;
  border-end-end-radius: 6px;
`

const TeamSection = () => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)

  // Hooks
  const { updateIntersections } = useIntersection()
  // Data
  const team = t('about.team', { returnObjects: true }) as {
    name: string
    position: string
    image: string
    color: string
  }[]

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id='team' className='plb-[100px] bg-backgroundDefault' ref={ref}>
      <div className={frontCommonStyles.layoutSpacing}>
        <div className='flex flex-col gap-y-4 items-center justify-center'>
          <Chip size='small' variant='tonal' color='primary' label={t('about.ourteam')} />
          <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
            <div className='flex items-center gap-x-2'>
              <Typography color='text.primary' variant='h4'>
                <span className='relative z-[1] font-extrabold'>
                  {t('about.Supported')}{' '}
                  <img
                    src='/images/front-pages/landing-page/bg-shape.png'
                    alt='bg-shape'
                    className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                  />
                </span>{' '}
                {t('about.byrealpeople')}{' '}
              </Typography>
            </div>
            <Typography className='text-center'> {t('about.whoisbehind')}</Typography>
          </div>
        </div>
        <Grid container rowSpacing={16} columnSpacing={6} className='pbs-[100px]'>
          {team.map((member, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
              <Card className='border overflow-visible' color={member.color as ThemeColor}>
                <div className='flex flex-col items-center justify-center p-0'>
                  <div
                    className={classnames(
                      'flex justify-center is-full mli-auto text-center bs-[189px] relative overflow-visible',
                      styles.teamCard
                    )}
                    style={{ backgroundColor: member.color }}
                  >
                    <img src={member.image} alt={member.name} className='bs-[240px] absolute block-start-[-50px]' />
                  </div>
                  <div className='flex flex-col gap-3 p-5 is-full'>
                    <div className='text-center'>
                      <Typography variant='h5'>{member.name}</Typography>
                      <Typography color='text.disabled'>{member.position}</Typography>
                    </div>
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  )
}

export default TeamSection
