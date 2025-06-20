'use client'

import { useState, useEffect, useRef, memo } from 'react'
import Card from '@mui/material/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import Button from '@mui/material/Button'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'
import type { SocialLinkSettings } from '@/types/adminSettingsTypes'
import Typography from '@mui/material/Typography'

// Create a memoized SocialField component
const SocialField = memo(
  ({
    platform,
    value,
    onChange,
    socialSettings,
    updateSocialLink
  }: {
    platform: keyof SocialLinkSettings
    value: string
    onChange: (value: string) => void
    socialSettings: SocialLinkSettings | null
    updateSocialLink: any
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { t } = useTranslation()

    const getImageKey = (platform: string) => {
      return platform === 'tiktok' ? 'tiktok_image' : `${platform}_image`
    }

    const getDisplayName = (platform: string) => {
      return platform === 'tiktok' ? 'TikTok' : platform.charAt(0).toUpperCase() + platform.slice(1)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && socialSettings?.id) {
        const formData = new FormData()
        formData.append(getImageKey(platform), file)
        updateSocialLink({
          id: socialSettings.id,
          formData
        })
      }
    }

    return (
      <div className='flex gap-4 items-center mb-4'>
        <div
          className='relative w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary flex items-center justify-center overflow-hidden group cursor-pointer'
          onClick={() => fileInputRef.current?.click()}
        >
          {socialSettings?.[getImageKey(platform) as keyof SocialLinkSettings] ? (
            <img
              src={socialSettings[getImageKey(platform) as keyof SocialLinkSettings] as string}
              alt={`${platform} icon`}
              className='w-full h-full object-contain'
            />
          ) : (
            <span className='text-gray-400'>No image</span>
          )}
          <input ref={fileInputRef} accept='image/*' className='hidden' type='file' onChange={handleFileChange} />
          <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
            <span className='text-white text-sm'>Upload</span>
          </div>
        </div>
        <div className='flex-1'>
          <CustomTextField
            label={getDisplayName(platform)}
            value={value}
            onChange={e => onChange(e.target.value)}
            fullWidth
          />
        </div>
      </div>
    )
  }
)

SocialField.displayName = 'SocialField'

const SocialSettings = () => {
  const { useSocialLinkSettings, useUpdateSocialLinkSettings } = useAdminSettingsHook('right')
  const { data: socialSettings, isLoading } = useSocialLinkSettings()
  const { mutate: updateSocialLink } = useUpdateSocialLinkSettings()
  const { t } = useTranslation()

  const [formData, setFormData] = useState<Partial<SocialLinkSettings>>({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    pinterest: '',
    tiktok: ''
  })

  useEffect(() => {
    if (socialSettings) {
      setFormData({
        facebook: socialSettings.facebook || '',
        instagram: socialSettings.instagram || '',
        twitter: socialSettings.twitter || '',
        linkedin: socialSettings.linkedin || '',
        youtube: socialSettings.youtube || '',
        pinterest: socialSettings.pinterest || '',
        tiktok: socialSettings.tiktok || ''
      })
    }
  }, [socialSettings])

  const handleFieldChange = (platform: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [platform]: value }))
  }

  const handleSave = async () => {
    if (socialSettings?.id) {
      await updateSocialLink({
        id: socialSettings.id,
        ...formData
      })
    }
  }

  const handleDiscard = () => {
    if (socialSettings) {
      setFormData({
        facebook: socialSettings.facebook || '',
        instagram: socialSettings.instagram || '',
        twitter: socialSettings.twitter || '',
        linkedin: socialSettings.linkedin || '',
        youtube: socialSettings.youtube || '',
        pinterest: socialSettings.pinterest || '',
        tiktok: socialSettings.tiktok || ''
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.socialLinkSettings')}
      </Typography>
      <div className='flex flex-col'>
        {(Object.keys(formData) as Array<keyof typeof formData>).map(platform => (
          <SocialField
            key={platform}
            platform={platform as keyof SocialLinkSettings}
            value={(formData[platform] || '') as string}
            onChange={handleFieldChange(platform as keyof typeof formData)}
            socialSettings={socialSettings || null}
            updateSocialLink={updateSocialLink}
          />
        ))}
      </div>
      <div className='flex justify-end gap-4 mt-4'>
        <Button variant='tonal' color='secondary' onClick={handleDiscard}>
          {t('adminSettings.discard')}
        </Button>
        <Button variant='contained' onClick={handleSave}>
          {t('adminSettings.saveChanges')}
        </Button>
      </div>
    </Card>
  )
}

export default SocialSettings
