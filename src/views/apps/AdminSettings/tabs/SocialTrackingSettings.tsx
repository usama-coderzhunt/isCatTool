'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Hook Imports
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'

// Types
import { SocialTrackingSettings as SocialTrackingSettingsType } from '@/types/adminSettingsTypes'

const SocialTrackingSettings = () => {
  const { useSocialTrackingSettings, useUpdateSocialTrackingSettings, useCreateSocialTrackingSettings } =
    useAdminSettingsHook('right')
  const { data: socialTrackingSettings, isLoading } = useSocialTrackingSettings()
  const { mutate: updateSocialTracking, isPending: isUpdating } = useUpdateSocialTrackingSettings()
  const { mutate: createSocialTrackingSettings } = useCreateSocialTrackingSettings()
  const { t } = useTranslation()

  const [socialTrackingForm, setSocialTrackingForm] = useState<Omit<SocialTrackingSettingsType, 'id'>>({
    google_analytics_code: '',
    facebook_pixel_code: ''
  })

  const [visibleFields, setVisibleFields] = useState<string[]>([])

  const toggleVisibility = (fieldLabel: string) => {
    setVisibleFields(current =>
      current.includes(fieldLabel) ? current.filter(field => field !== fieldLabel) : [...current, fieldLabel]
    )
  }

  useEffect(() => {
    if (socialTrackingSettings) {
      setSocialTrackingForm({
        google_analytics_code: socialTrackingSettings.google_analytics_code || '',
        facebook_pixel_code: socialTrackingSettings.facebook_pixel_code || ''
      })
    }
  }, [socialTrackingSettings])

  const handleSave = () => {
    if (socialTrackingSettings?.id) {
      updateSocialTracking({
        id: socialTrackingSettings.id,
        ...socialTrackingForm
      })
    } else {
      createSocialTrackingSettings(socialTrackingForm)
    }
  }

  const handleDiscard = () => {
    if (socialTrackingSettings) {
      setSocialTrackingForm({
        google_analytics_code: socialTrackingSettings.google_analytics_code || '',
        facebook_pixel_code: socialTrackingSettings.facebook_pixel_code || ''
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.socialTrackingSettings')}
      </Typography>

      <div className='flex flex-col gap-5'>
        <CustomTextField
          label={t('adminSettings.googleAnalyticsPixelCode')}
          value={socialTrackingForm.google_analytics_code}
          type={visibleFields.includes('google_analytics') ? 'text' : 'password'}
          fullWidth
          onChange={e =>
            setSocialTrackingForm(prev => ({
              ...prev,
              google_analytics_code: e.target.value
            }))
          }
          disabled={isUpdating}
          multiline
          rows={1}
          placeholder={t('adminSettings.enterGoogleAnalyticsCode')}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    onClick={() => toggleVisibility('google_analytics')}
                    onMouseDown={e => e.preventDefault()}
                  ></IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <CustomTextField
          label={t('adminSettings.facebookPixelCode')}
          value={socialTrackingForm.facebook_pixel_code}
          type='text'
          fullWidth
          onChange={e =>
            setSocialTrackingForm(prev => ({
              ...prev,
              facebook_pixel_code: e.target.value
            }))
          }
          disabled={isUpdating}
          multiline
          rows={1}
          placeholder={t('adminSettings.enterFacebookPixelCode')}
        />
      </div>

      <div className='flex justify-end gap-4 mt-4'>
        <Button variant='tonal' color='secondary' onClick={handleDiscard} disabled={isUpdating}>
          {t('adminSettings.discard')}
        </Button>
        <Button variant='contained' onClick={handleSave} disabled={isUpdating}>
          {t('adminSettings.saveChanges')}
        </Button>
      </div>
    </Card>
  )
}

export default SocialTrackingSettings
