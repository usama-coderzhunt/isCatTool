// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { useTranslation } from 'react-i18next'
import { ServiceTypes } from '@/types/services'
import { stripHtmlTags } from '@/utils/utility/stripeHtmlTags'
import CircularLoader from '@/components/CircularLoader'
import { Divider } from '@mui/material'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

const ServiceFAQS = ({
  serviceData,
  loading,
  bgColor,
  onEditFaq,
  onDeleteFaq,
  className,
  isDashboardPage
}: {
  serviceData?: ServiceTypes
  loading: boolean
  bgColor?: string
  onEditFaq?: (question: string, answer: string) => void
  onDeleteFaq?: (question: string) => void
  className?: string
  isDashboardPage?: boolean
}) => {
  const { t } = useTranslation('global')
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)

  // Hooks
  const { updateIntersections } = useIntersection()
  const [expanded, setExpanded] = useState<string | false>('service-faq-0')
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedFaq, setSelectedFaq] = useState<{ question: string; answer: string } | null>(null)

  // Handle accordion change
  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, question: string, answer: string) => {
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setSelectedFaq({ question, answer })
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    setSelectedFaq(null)
  }

  const handleEdit = () => {
    if (selectedFaq && onEditFaq) {
      onEditFaq(selectedFaq.question, selectedFaq.answer)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedFaq && onDeleteFaq) {
      onDeleteFaq(selectedFaq.question)
    }
    handleMenuClose()
  }

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
    <section id='faq' ref={ref} className={classnames(isDashboardPage ? className : 'py-20 bg-backgroundPaper')}>
      <div className={classnames('flex flex-col gap-16', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col gap-y-4 items-center justify-center max-w-[60%] w-full mx-auto'>
          <Chip size='small' variant='tonal' color='primary' label={t('services.serviceFAQS')} />
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
            {serviceData?.short_description && (
              <Typography className='text-center'>{stripHtmlTags(serviceData.short_description)}</Typography>
            )}
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
                {loading ? (
                  <div className='flex items-center justify-center h-full mt-10'>
                    <CircularLoader size={40} />
                  </div>
                ) : !serviceData?.faq || Object.keys(serviceData.faq).length === 0 ? (
                  <Typography variant='body1' className='text-center py-4'>
                    {t('services.noFaqsFound')}
                  </Typography>
                ) : (
                  Object.entries(serviceData.faq).map(([question, answer], index) => (
                    <Accordion
                      key={`service-faq-${index}`}
                      expanded={expanded === `service-faq-${index}`}
                      onChange={handleChange(`service-faq-${index}`)}
                    >
                      <AccordionSummary
                        aria-controls={`service-faq-${index}-content`}
                        id={`service-faq-${index}-header`}
                        expandIcon={
                          <i
                            className={`${expanded === `service-faq-${index}` ? 'tabler-chevron-right' : 'tabler-chevron-right'}`}
                          />
                        }
                      >
                        <div className='flex justify-between items-center w-full'>
                          <Typography>{question}</Typography>
                          {isSuperUser ||
                            (userRole === 'Admin' && (
                              <IconButton
                                size='small'
                                onClick={e => handleMenuOpen(e, question, answer)}
                                sx={{ ml: 2 }}
                              >
                                <i className='tabler-dots-vertical' />
                              </IconButton>
                            ))}
                        </div>
                      </AccordionSummary>
                      <Divider className='mb-2' />
                      <AccordionDetails>{answer}</AccordionDetails>
                    </Accordion>
                  ))
                )}
              </div>
            </Grid>
          </Grid>
        </div>
      </div>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={handleEdit}>
          <i className='tabler-edit me-2' />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleDelete} className='text-error'>
          <i className='tabler-trash me-2' />
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </section>
  )
}

export default ServiceFAQS
