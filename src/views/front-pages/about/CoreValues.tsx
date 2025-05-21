'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import { Button, Chip, Card, CardContent, Grid, Box } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

// SVG Icon for Integrity
import type { SVGAttributes } from 'react'
import IntegrityIcon from '@/assets/svg/front-pages/landing-page/Integrity'
import InnovationIcon from '@/assets/svg/front-pages/landing-page/Innovation'
import CollaborationIcon from '@/assets/svg/front-pages/landing-page/Collaboration'
import ExcellenceIcon from '@/assets/svg/front-pages/landing-page/Excellence'
import CustomerFocusIcon from '@/assets/svg/front-pages/landing-page/CustomerFocus'
import SustainabilityIcon from '@/assets/svg/front-pages/landing-page/Sustainability'
// i18n
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

type CoreValue = {
  title: string
  description: string
  icon?: React.ElementType
}

const CoreValuesCard = ({ val }: { val: CoreValue }) => (
  <Card
    sx={{ maxWidth: 345, margin: 'auto', height: '100%', textAlign: 'center', p: 4 }}
    className='group shadow-md hover:shadow-xl transition ease-in-out duration-300'
  >
    <div
      className='w-[60px] h-[60px] flex items-center justify-center rounded-full mb-2
                   bg-primaryLighter group-hover:bg-primary transition-colors duration-300'
    >
      {/* Icon color: primary by default, white on hover */}
      {val.icon && <val.icon className='text-primary group-hover:text-white transition-colors duration-300' />}
    </div>

    <CardContent className='p-3 text-left'>
      <Typography gutterBottom variant='h5' component='div' fontWeight='bold'>
        {val.title}
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {val.description}
      </Typography>
    </CardContent>
  </Card>
)

const CoreValues = ({ mode }: { mode: SystemMode }) => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const values: CoreValue[] = [
    {
      title: t('about.coreValues.values.title1'),
      description: t('about.coreValues.values.description1'),
      icon: InnovationIcon
    },
    {
      title: t('about.coreValues.values.title2'),
      description: t('about.coreValues.values.description2'),
      icon: IntegrityIcon
    },
    {
      title: t('about.coreValues.values.title3'),
      description: t('about.coreValues.values.description3'),
      icon: CollaborationIcon
    },
    {
      title: t('about.coreValues.values.title4'),
      description: t('about.coreValues.values.description4'),
      icon: ExcellenceIcon
    },
    {
      title: t('about.coreValues.values.title5'),
      description: t('about.coreValues.values.description5'),
      icon: CustomerFocusIcon
    },
    {
      title: t('about.coreValues.values.title6'),
      description: t('about.coreValues.values.description6'),
      icon: SustainabilityIcon
    }
  ]
  return (
    <section id='values' className={classnames('py-12 plb-[100px]', frontCommonStyles.layoutSpacing)}>
      <div className='text-center mbe-10'>
        <Chip size='small' variant='tonal' color='primary' label={t('about.coreValues.label')} />
        <Typography variant='h4' className='font-extrabold mt-4' color={mode === 'dark' ? 'white' : 'text.primary'}>
          {t('about.coreValues.stand')}
        </Typography>
      </div>

      <Grid container spacing={4} justifyContent='center'>
        {values.map(val => (
          <Grid item xs={12} sm={6} md={4} key={val.title}>
            <CoreValuesCard val={val} />
          </Grid>
        ))}
      </Grid>
    </section>
  )
}

export default CoreValues
