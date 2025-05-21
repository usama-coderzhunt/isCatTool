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
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'

import { zodResolver } from '@hookform/resolvers/zod'

import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { loginSchema } from '@/utils/schemas/loginSchema'

// Styled Component Imports

// Hooks Import
import { useUserHooks } from '@/services/useUserHooks'

import AuthIllustrationWrapper from './pages/auth/AuthIllustrationWrapper'
import { LoginInput } from '@/types/authTypes'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import { useTemplateStore } from '@/store/templateStore'
const Login = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const { recaptchaToken } = useRecaptchaStore();
  const { templateName } = useTemplateStore()
  // Hooks
  const { lang: locale } = useParams()
  const { t, i18n } = useTranslation('global')
  
  useEffect(() => {
    i18n.changeLanguage(locale as string)
  }, [locale, i18n])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Api Call
  const { useLogin } = useUserHooks()
  const { mutate: userLogin } = useLogin()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit'
  })

  const onSubmit: SubmitHandler<LoginInput> = data => {
    if (!recaptchaToken && process.env.NEXT_PUBLIC_ENV !== "development") {
      return;
    }
    userLogin(data, {
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
            <Typography variant='h4'>{`${t('auth.login.welcome')} ${templateName}! 👋🏻`}</Typography>
            <Typography>{t('auth.login.signInMessage')}</Typography>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off' className='flex flex-col gap-6'>
            <CustomTextField
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              label={t('auth.login.emailOrUsername')}
              placeholder={t('auth.login.emailPlaceholder')}
              {...register('email')}
            />
            <CustomTextField
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              label={t('auth.login.password')}
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              {...register('password')}
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
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox />} label={t('auth.login.rememberMe')} />
              <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href={getLocalizedUrl(`/pages/auth/forgot-password-v1`, locale as Locale)}
              >
                {t('auth.login.forgotPassword')}
              </Typography>
            </div>
            {/* Recaptcha */}
            <Recaptcha />
            <Button fullWidth variant='contained' type='submit' disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
            >
              {t('auth.login.loginButton')}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{t('auth.login.newOnPlatform')}</Typography>
              <Typography
                component={Link}
                href={getLocalizedUrl(`/${locale}/register`, locale as Locale)}
                color='primary.main'
              >
                {t('auth.login.createAccount')}
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>{t('auth.login.or')}</Divider>
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

export default Login
