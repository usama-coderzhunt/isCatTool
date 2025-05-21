'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'

// Type Imports
import type { SystemMode } from '@core/types'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { useEffect } from 'react'

const CompanyHistory = ({ mode }: { mode: SystemMode }) => {
  const textColor = mode === 'dark' ? 'white' : 'text.secondary'
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const contents = t('about.ourStory', { returnObjects: true }) as {
    heading: string
    content: string[]
  }

  return (
    <section id='history' className={classnames('py-12 plb-[100px]', frontCommonStyles.layoutSpacing)}>
      <Typography color='text.primary' variant='h4' className='text-center mb-6'>
        <span className='relative z-[1] font-extrabold inline-block'>
          {t('about.ourStory.heading')}{' '}
          <img
            src='/images/front-pages/landing-page/bg-shape.png'
            alt='bg-shape'
            className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
          />
        </span>
      </Typography>

      <Box className='max-w-[800px] mli-auto text-center' color={textColor}>
        {contents.content.map((item, index) => (
          <>
            <Typography key={index} variant='body1' paragraph>
              {item}
            </Typography>
          </>
        ))}
      </Box>
    </section>
  )
}

export default CompanyHistory
