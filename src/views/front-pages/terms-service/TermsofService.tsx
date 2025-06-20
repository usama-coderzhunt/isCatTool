'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'

// Third-party Imports
import classnames from 'classnames'

// Type Imports

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { useEffect } from 'react'

const TermsOfService = ({ mode }: any) => {
  const textColor = mode === 'dark' ? 'white' : 'text.secondary'
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  // Total sections — update this number if more sections are added in your JSON
  const totalSections = 20

  const renderSection = (index: number) => {
    const key = index === 0 ? 'overview' : `section${index}`
    const title = t(`termsAndConditions.${key}.title`, '')
    const content = t(`termsAndConditions.${key}.content`, { returnObjects: true }) as string[]

    return (
      <Box key={index} className='mb-8'>
        <Typography variant='h6' color='text.primary' className='mt-6 mb-3 font-bold'>
          {title}
        </Typography>
        {Array.isArray(content) &&
          content.map((paragraph, pIndex) => (
            <Typography key={pIndex} variant='body1' paragraph color={textColor}>
              {paragraph}
            </Typography>
          ))}
      </Box>
    )
  }

  return (
    <section className={classnames('py-12 plb-[100px]', frontCommonStyles.layoutSpacing)}>
      <Container maxWidth='lg'>
        <Typography color='text.primary' variant='h4' className='text-center mb-6'>
          <span className='relative z-[1] font-extrabold inline-block'>
            {t('termsAndConditions.mainTitle')}{' '}
            <img
              src='/images/front-pages/landing-page/bg-shape.png'
              alt='bg-shape'
              className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
            />
          </span>
        </Typography>

        <Box className='max-w-[900px] mli-auto mt-8'>
          {Array.from({ length: totalSections + 1 }, (_, i) => renderSection(i))}
        </Box>
      </Container>
    </section>
  )
}

export default TermsOfService
