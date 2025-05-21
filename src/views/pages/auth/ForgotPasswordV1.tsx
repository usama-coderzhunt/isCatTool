'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Type Imports
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'next-i18next'

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form'

import type { Locale } from '@configs/i18n'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { forgotSchema } from '@/utils/schemas/forgotSchema'

// Styled Component Imports
import AuthIllustrationWrapper from './AuthIllustrationWrapper'

// Hooks
import { useUserHooks } from '@/services/useUserHooks'
import { forgotInput } from '@/types/forgot'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'

const ForgotPasswordV1 = () => {
  // store
  const { recaptchaToken } = useRecaptchaStore();

  // Hooks
  const { lang: locale } = useParams()
  const { t, i18n } = useTranslation('global')
  
  useEffect(() => {
    i18n.changeLanguage(locale as string)
  }, [locale, i18n])

  // Api Call
  const { useForgotPassword } = useUserHooks();
  const { mutate: forgotPassword, isLoading } = useForgotPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<forgotInput>({
    resolver: zodResolver(forgotSchema),
    mode: 'onTouched'
  });
  const onSubmit: SubmitHandler<forgotInput> = (data) => {
    if (!recaptchaToken && process.env.NEXT_PUBLIC_ENV !== "development") {
      return;
    }
    forgotPassword(data.email, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>{t('auth.forgotPassword.title')}</Typography>
            <Typography>{t('auth.forgotPassword.description')}</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <CustomTextField 
              autoFocus 
              fullWidth 
              label={t('auth.forgotPassword.emailLabel')} 
              placeholder={t('auth.forgotPassword.emailPlaceholder')} 
              error={!!errors.email}
              helperText={errors.email?.message} 
              {...register('email')} 
            />
            {/* Recaptcha */}
            <Recaptcha />
            <Button 
              fullWidth 
              variant='contained' 
              type='submit' 
              disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
            >
              {t('auth.forgotPassword.sendButton')}
            </Button>
            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link
                href={getLocalizedUrl(`/${locale}/login`, locale as Locale)}
                className='flex items-center gap-1.5'
              >
                <DirectionalIcon
                  ltrIconClass='tabler-chevron-left'
                  rtlIconClass='tabler-chevron-right'
                  className='text-xl'
                />
                <span>{t('auth.forgotPassword.backToLogin')}</span>
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default ForgotPasswordV1
