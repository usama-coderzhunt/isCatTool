'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CustomLogo from '@/@core/components/mui/LogoUpload'
import Typography from '@mui/material/Typography'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useLogoStore } from '@/store/logoStore'
import { useSettings } from '@/@core/hooks/useSettings'
import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

const LogoSettings = () => {
  const { t } = useTranslation()
  const { selectedLogoType, handleLogoTypeChange, setSelectedLogo } = useLogoStore()
  const { useLogoSettings, useUpdateLogoSettings } = useAdminSettingsHook('right')
  const { data: logoSettings, isLoading: isLogoLoading } = useLogoSettings()
  const { mutate: updateLogo } = useUpdateLogoSettings()

  const handleFileChange = async (file: File, type: string) => {
    if (!logoSettings?.id) return

    const formData = new FormData()
    formData.append(type, file)
    handleLogoTypeChange(type)

    await updateLogo({
      id: logoSettings.id,
      formData
    })
  }

  useEffect(() => {
    if (logoSettings) {
      setSelectedLogo(logoSettings)
    }
  }, [logoSettings])

  if (isLogoLoading) return <div>Loading...</div>

  return (
    <div className='flex flex-col gap-4'>
      <Card className='p-6'>
        <Typography className='mb-4' variant='h4'>
          {t('adminSettings.logoSettings')}
        </Typography>
        <div className='overflow-y-auto hide-scrollbar w-full'>
          <div className='flex flex-row justify-between w-full p-2 gap-2'>
            <span
              className={`cursor-pointer flex flex-col items-center gap-2 p-1`}
              onClick={() => handleLogoTypeChange('light_logo')}
            >
              <CustomLogo
                variant='rounded'
                size={200}
                src={logoSettings?.light_logo}
                onUpload={handleFileChange}
                logoType='light_logo'
                sx={{
                  '& .MuiAvatar-img': {
                    objectFit: 'none'
                  },
                  border: '2px solid #e0e0e0'
                }}
              />
              <Typography variant='h6'>{t('adminSettings.lightLogo')}</Typography>
            </span>
            <span
              className={`cursor-pointer flex flex-col items-center gap-2 p-0`}
              onClick={() => handleLogoTypeChange('dark_logo')}
            >
              <CustomLogo
                variant='rounded'
                size={200}
                src={logoSettings?.dark_logo}
                onUpload={handleFileChange}
                logoType='dark_logo'
                sx={{
                  '& .MuiAvatar-img': {
                    objectFit: 'none'
                  },
                  border: '2px solid #e0e0e0'
                }}
              />
              <Typography variant='h6'>{t('adminSettings.darkLogo')}</Typography>
            </span>
            <span
              className={`cursor-pointer flex flex-col items-center gap-2 p-1`}
              onClick={() => handleLogoTypeChange('favicon')}
            >
              <CustomLogo
                variant='rounded'
                size={200}
                src={logoSettings?.favicon}
                onUpload={handleFileChange}
                logoType='favicon'
                sx={{
                  '& .MuiAvatar-img': {
                    objectFit: 'none'
                  },
                  border: '2px solid #e0e0e0'
                }}
              />
              <Typography variant='h6'>{t('adminSettings.favicon')}</Typography>
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LogoSettings
