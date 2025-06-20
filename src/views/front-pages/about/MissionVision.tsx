'use client'

// MUI Imports
import Typography from '@mui/material/Typography'

import classnames from 'classnames'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'

// Type Imports

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { Chip } from '@mui/material'

const MissionVision = ({ mode }: any) => {
  const textColor = mode === 'dark' ? 'white' : 'text.secondary'

  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  return (
    <section id='mission-vision' className='py-12  plb-[100px] bg-backgroundDefault'>
      <div className={classnames(frontCommonStyles.layoutSpacing)}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center '>
          <div className='w-full max-w-md md:ml-[-50px] py-10'>
            <Typography variant='h5' className='font-bold mbe-4' color='text.primary'>
              <Chip size='small' variant='tonal' color='primary' label={t('about.ourMission.label')} />
            </Typography>
            <Typography color='text.secondary'>{t('about.ourMission.detail')}</Typography>
          </div>
          <div className='w-full max-w-md md:mr-[-50px] py-10'>
            <Typography variant='h5' className='font-bold mbe-4' color='text.primary'>
              <Chip size='small' variant='tonal' color='primary' label={t('about.ourVision.label')} />
            </Typography>
            <Typography color='text.secondary'>{t('about.ourVision.detail')}</Typography>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MissionVision
