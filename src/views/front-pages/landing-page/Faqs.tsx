// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from './styles.module.css'
import { useTranslation } from 'react-i18next'

type FaqsDataTypes = {
  id: string
  question: string
  active?: boolean
  answer: string
}

const Faqs = () => {
  const { t } = useTranslation('global')

  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)

  // State for controlling accordion
  const faqs = t('landingPage.faqs.questions', { returnObjects: true }) as FaqsDataTypes[]

  // Add IDs to the translated FAQs
  const faqsWithIds = faqs.map((faq, index) => ({
    ...faq,
    id: `panel${index + 1}`
  }))

  const [expanded, setExpanded] = useState<string | false>(faqsWithIds[0]?.id || false)

  // Handle accordion change
  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  // Hooks
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
  }, [])

  return (
    <section id='faq' ref={ref} className={classnames('plb-[100px] bg-backgroundPaper', styles.sectionStartRadius)}>
      <div className={classnames('flex flex-col gap-16', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col gap-y-4 items-center justify-center'>
          <Chip size='small' variant='tonal' color='primary' label={t('landingPage.faqs.label')} />
          <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
            <div className='flex items-center gap-x-2'>
              <Typography color='text.primary' variant='h4'>
                {t('landingPage.faqs.title')}
                <span className='relative z-[1] font-extrabold'>
                  <img
                    src='/images/front-pages/landing-page/bg-shape.png'
                    alt='bg-shape'
                    className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[8%] block-start-[17px]'
                  />{' '}
                  {t('landingPage.faqs.question')}
                </span>
              </Typography>
            </div>
            <Typography className='text-center'>{t('landingPage.faqs.description')}</Typography>
          </div>
        </div>
        <div>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, lg: 5 }} className='text-center'>
              <img
                src='/images/front-pages/landing-page/boy-sitting-with-laptop.png'
                alt='boy with laptop'
                className='is-[80%] max-is-[320px]'
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 7 }}>
              <div>
                {faqsWithIds.map(data => (
                  <Accordion key={data.id} expanded={expanded === data.id} onChange={handleChange(data.id)}>
                    <AccordionSummary aria-controls={`${data.id}-content`} id={`${data.id}-header`}>
                      {data.question}
                    </AccordionSummary>
                    <AccordionDetails>{data.answer}</AccordionDetails>
                  </Accordion>
                ))}
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </section>
  )
}

export default Faqs
