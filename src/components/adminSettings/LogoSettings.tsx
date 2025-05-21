'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { Box, FormControl, InputLabel, MenuItem, Select, CircularProgress } from '@mui/material'
import CustomLogo from '@/@core/components/mui/LogoUpload'

// Hook Imports
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useLogoStore } from '@/store/logoStore'
import { useTranslation } from 'next-i18next'
type LogoType = 'light_logo' | 'dark_logo' | 'favicon'

const LogoSettings = () => {
  const { useLogoSettings ,useUpdateLogoSettings ,useCreateLogoSettings} = useAdminSettingsHook()
  const { data: logoSettings, isLoading } = useLogoSettings()
  const { selectedLogoType, handleLogoTypeChange, handleLogoUpload } = useLogoStore()
  const { mutate: updateLogo } = useUpdateLogoSettings()
  const { mutate: createLogoSettings } = useCreateLogoSettings()
  const [currentImage, setCurrentImage] = useState<string>('')
  const { t } = useTranslation('global')
  // Update current image whenever selectedLogoType or logoSettings changes
  useEffect(() => {
    if (logoSettings) {
      const logoMap: Record<string, string> = {
        light_logo: logoSettings?.light_logo,
        dark_logo: logoSettings?.dark_logo,
        favicon: logoSettings?.favicon
      };
      setCurrentImage(logoMap[selectedLogoType]);
    }
  }, [logoSettings, selectedLogoType])
  
  const logoTypes = [
    { value: 'light_logo', label: t('adminSettings.lightLogo') },
    { value: 'dark_logo', label: t('adminSettings.darkLogo') },
    { value: 'favicon', label: t('adminSettings.favicon') }
  ]

  return (
    <Card className='p-5 h-screen flex flex-col items-center justify-center'>
      <Box className='flex flex-col items-center justify-center gap-6'>

        <CardContent className='flex flex-col items-center gap-4'>
          <div className='relative'>
            {(isLoading) && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg z-10'>
                <CircularProgress size={30} />
              </div>
            )}
            <CustomLogo 
              variant='rounded' 
              size={200}   
              src={currentImage}
              onUpload={(file) => { handleLogoUpload( selectedLogoType, logoSettings?.id , file, logoSettings?.id !== undefined ? updateLogo : createLogoSettings)}}
              sx={{ 
                '& .MuiAvatar-img': {
                  objectFit: 'none'
                },
                border: '2px solid #e0e0e0'
              }}
            />
          </div>
        </CardContent>
        <FormControl className='w-1/2'>
          <InputLabel id="logo-type-select-label">{t('adminSettings.logoSelectLabel')}</InputLabel>
          <Select
            labelId="logo-type-select-label"
            value={selectedLogoType}
            label={t('adminSettings.logoSelectLabel')}
            onChange={(e) => handleLogoTypeChange(e.target.value as LogoType)}
          >
            {logoTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Card>
  )
}

export default LogoSettings
