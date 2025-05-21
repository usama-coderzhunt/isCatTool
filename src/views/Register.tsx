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
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Type Imports
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'next-i18next'

import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { registerSchema } from '@/utils/schemas/registerSchema'

// Styled Component Imports

// Hook Imports
import { useUserHooks } from '@/services/useUserHooks'

import AuthIllustrationWrapper from './pages/auth/AuthIllustrationWrapper'
import { RegisterType } from '@/types/authTypes'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'

const Register = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const { lang: locale } = useParams()
  const { t, i18n } = useTranslation('global')
  
  useEffect(() => {
    i18n.changeLanguage(locale as string)
  }, [locale, i18n])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Api Call
  const { useRegisterUser } = useUserHooks()
  const { mutate: userSignUp } = useRegisterUser()

  // store
  const { recaptchaToken } = useRecaptchaStore();


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  })

  const onSubmit: SubmitHandler<RegisterType> = data => {
    if (!recaptchaToken && process.env.NEXT_PUBLIC_ENV !== "development") {
      return;
    }
    userSignUp(data, {
      onSuccess: () => {
        reset()
      }
    })
  }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>{t('auth.register.title')}</Typography>
            <Typography>{t('auth.register.description')}</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <CustomTextField
              autoFocus
              fullWidth
              label={t('auth.register.usernameLabel')}
              placeholder={t('auth.register.usernamePlaceholder')}
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <CustomTextField
              fullWidth
              label={t('auth.register.emailLabel')}
              placeholder={t('auth.register.emailPlaceholder')}
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <CustomTextField
              fullWidth
              label={t('auth.register.passwordLabel')}
              placeholder={t('auth.register.passwordPlaceholder')}
              type={isPasswordShown ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label={
                <>
                  <span>{t('auth.register.agreeText')} </span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    {t('auth.register.privacyPolicy')}
                  </Link>
                </>
              }
            />
            {/* Recaptcha */}
            <Recaptcha />
            <Button 
              fullWidth 
              variant={'contained'} 
              type='submit' 
              disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
            >
              {t('auth.register.signUpButton')}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{t('auth.register.alreadyAccount')}</Typography>
              <Typography 
                component={Link} 
                href={getLocalizedUrl(`/${locale}/login`, locale as Locale)} 
                color='primary.main'
              >
                {t('auth.register.signInInstead')}
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>{t('auth.register.or')}</Divider>
            <div className='flex justify-center items-center gap-1.5'>
              <IconButton className='text-facebook' size='small'>
                <i className='tabler-brand-facebook-filled' />
              </IconButton>
              <IconButton className='text-twitter' size='small'>
                <i className='tabler-brand-twitter-filled' />
              </IconButton>
              <IconButton className='text-textPrimary' size='small'>
                <i className='tabler-brand-github-filled' />
              </IconButton>
              <IconButton className='text-error' size='small'>
                <i className='tabler-brand-google-filled' />
              </IconButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default Register
