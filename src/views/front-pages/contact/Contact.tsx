'use client'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'next-i18next'
import classnames from 'classnames'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import { useIntersection } from '@/hooks/useIntersection'
import { useSendEmail } from '@/services/utility/useSendEmail'

import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from '../landing-page/styles.module.css'
import { useParams } from 'next/navigation'
import PhoneInput from '@/components/phoneInput'
import { Controller, useForm } from 'react-hook-form'

const Contact = () => {
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)

  const { updateIntersections } = useIntersection()
  const { sendEmail, loading } = useSendEmail()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      // Keep these if they're needed for other functionality
      description: '',
      categories: '',
      short_description: '',
      image: null,
      clients: [],
      features_list: {}
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if running in browser
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const onSubmit = async (data: any) => {
    const success = await sendEmail({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      message: data.message
    })

    if (success) {
      reset()
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return // Only run in browser

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

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.disconnect()
      }
    }
  }, [updateIntersections])

  return (
    <section id={t('contact.sectionId') || 'contact'} className='plb-[100px] bg-backgroundDefault' ref={ref}>
      <div className={classnames('flex flex-col gap-14', frontCommonStyles.layoutSpacing)}>
        {/* Header */}
        <div className='flex flex-col gap-y-4 items-center justify-center'>
          <Chip size='small' variant='tonal' color='primary' label={t('contact.chipLabel') || 'Contact Us'} />
          <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
            <div className='flex items-center gap-x-2'>
              <Typography color='text.primary' variant='h4'>
                <span className='relative z-[1] font-extrabold'>
                  {t('contact.header.title') || 'Get in Touch'}
                  <img
                    src='/images/front-pages/landing-page/bg-shape.png'
                    alt='bg-shape'
                    className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                  />
                </span>
              </Typography>
            </div>
            <Typography className='text-center'>{t('contact.header.subtitle')}</Typography>
          </div>
        </div>

        {/* Contact Info and Form */}
        <div className='lg:pis-[38px]'>
          <Grid container spacing={6}>
            {/* Contact Details */}
            <Grid size={{ xs: 12, md: 6, lg: 5 }}>
              <div className={classnames('border p-[10px] relative', styles.contactRadius)}>
                <img
                  src='/images/front-pages/landing-page/contact-border.png'
                  className='absolute -block-start-[7%] -inline-start-[8%] max-is-full max-lg:hidden'
                  alt='contact-border'
                  width='180'
                />
                <img
                  src='/images/front-pages/landing-page/customer-service.png'
                  alt='customer-service'
                  className={classnames('is-full', styles.contactRadius)}
                />
                <div className='flex justify-between flex-wrap gap-4 pli-6 pbs-4 pbe-[10px]'>
                  <div className='flex gap-3 item-center '>
                    <i className='tabler-mail text-[#7C8B9D] h-full' />
                    <div>
                      <Typography>{t('contact.contactInfo.emailLabel') || 'Email'}</Typography>
                      <Typography color='text.primary' className='font-medium'>
                        {t('contact.contactInfo.emailValue')}
                      </Typography>
                    </div>
                  </div>
                  <div className='flex gap-3 item-center '>
                    <i className='tabler-phone text-[#7C8B9D] h-full' />

                    <div>
                      <Typography>{t('contact.contactInfo.phoneLabel') || 'Phone'}</Typography>
                      <Typography color='text.primary' className='font-medium'>
                        {t('contact.contactInfo.phoneValue') || '+1 (555) 123-4567'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>

            {/* Form */}
            <Grid size={{ xs: 12, md: 6, lg: 7 }}>
              <Card>
                <CardContent>
                  <div className='flex flex-col gap-y-[6px] mbe-6'>
                    <Typography variant='h4'>{t('contact.formCard.title') || 'Send us a message'}</Typography>
                    <Typography>
                      {t('contact.formCard.description') || "We'll get back to you as soon as possible"}
                    </Typography>
                  </div>
                  <form className='flex flex-col items-start gap-6' onSubmit={handleSubmit(onSubmit)}>
                    <div className='flex gap-5 is-full'>
                      <Controller
                        name='name'
                        control={control}
                        rules={{ required: 'Name is required' }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            label={t('contact.formCard.fields.name')}
                            error={!!errors.name}
                            helperText={errors.name?.message as string}
                            fullWidth
                            showAsterisk={true}
                            sx={{
                              '& .MuiInputLabel-root': {
                                background: 'white',
                                padding: '0 4px'
                              },
                              '& .MuiInputLabel-shrink': {
                                transform: 'translate(14px, -9px) scale(0.75)'
                              }
                            }}
                          />
                        )}
                      />

                      <Controller
                        name='email'
                        control={control}
                        rules={{
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            label={t('contact.formCard.fields.email')}
                            type='email'
                            error={!!errors.email}
                            helperText={errors.email?.message as string}
                            fullWidth
                            showAsterisk={true}
                            sx={{
                              '& .MuiInputLabel-root': {
                                background: 'white',
                                padding: '0 4px'
                              },
                              '& .MuiInputLabel-shrink': {
                                transform: 'translate(14px, -9px) scale(0.75)'
                              }
                            }}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name='phone'
                      control={control}
                      rules={{
                        pattern: {
                          value: /^\+?[1-9]\d{7,14}$/, // Requires 8–15 digits total
                          message: 'Invalid phone number. Please enter a valid number (e.g., +1234567890).'
                        }
                      }}
                      render={({ field }) => (
                        <PhoneInput
                          initialPhoneNumber={field.value}
                          label={t('contact.formCard.fields.phone')}
                          onPhoneNumberChange={(newValue: string) => {
                            // Remove all non-digit characters except the leading +
                            const cleanedValue = newValue.replace(/[^+\d]/g, '')
                            console.log('Cleaned value:', cleanedValue) // Debug the cleaned value
                            field.onChange(cleanedValue)
                          }}
                          error={!!errors.phone}
                          helperText={errors.phone?.message as string}
                        />
                      )}
                    />
                    <Controller
                      name='message'
                      control={control}
                      rules={{ required: 'Message is required' }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          label={t('contact.formCard.fields.message')}
                          error={!!errors.message}
                          helperText={errors.message?.message as string}
                          fullWidth
                          multiline
                          rows={7}
                          showAsterisk={true}
                          sx={{
                            '& .MuiInputLabel-root': {
                              background: 'white',
                              padding: '0 4px'
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(14px, -9px) scale(0.75)'
                            }
                          }}
                        />
                      )}
                    />

                    <Button variant='contained' type='submit' disabled={loading}>
                      {loading
                        ? t('contact.formCard.submitButton.loading') || 'Sending...'
                        : t('contact.formCard.submitButton.default') || 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
    </section>
  )
}

export default Contact
