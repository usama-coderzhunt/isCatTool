'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'

// Third-party Imports
import classnames from 'classnames'

// Type Imports

// i18n
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

const PrivacyHeroSection = ({ mode }: any) => {
  const textColor = mode === 'dark' ? 'white' : 'text.secondary'
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const sections = t('privacyPolicy.sections', { returnObjects: true }) as {
    title: string
    content: string[]
  }[]

  const renderParagraphWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <Link key={index} href={part} target='_blank' rel='noopener noreferrer' color='primary'>
          {part}
        </Link>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }

  return (
    <section className={classnames('py-12 plb-[100px]', frontCommonStyles.layoutSpacing)}>
      <Container maxWidth='lg'>
        <Typography color='text.primary' variant='h4' className='text-center mb-6'>
          <span className='relative z-[1] font-extrabold inline-block'>
            {t('privacyPolicy.mainTitle')}{' '}
            <img
              src='/images/front-pages/landing-page/bg-shape.png'
              alt='bg-shape'
              className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
            />
          </span>
        </Typography>

        <Box className='max-w-[900px] mli-auto mt-8'>
          {sections.map((section, index) => (
            <Box key={index} className='mb-8'>
              <Typography variant='h6' color='text.primary' className='mt-6 mb-3 font-bold'>
                {section.title}
              </Typography>
              {section.content.map((paragraph, pIndex) => (
                <Typography key={pIndex} variant='body1' paragraph color={textColor}>
                  {renderParagraphWithLinks(paragraph)}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      </Container>
    </section>
  )
}

export default PrivacyHeroSection
