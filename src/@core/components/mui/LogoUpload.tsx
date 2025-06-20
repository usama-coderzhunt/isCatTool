'use client'

// React Imports
import { forwardRef, useState, useEffect, useRef } from 'react'

// MUI Imports
import MuiLogo from '@mui/material/Avatar'
import { lighten, styled } from '@mui/material/styles'
import type { AvatarProps } from '@mui/material/Avatar'

// Type Imports
import type { ThemeColor } from '@core/types'
import { Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

export type CustomLogoProps = AvatarProps & {
  color?: ThemeColor
  skin?: 'filled' | 'light' | 'light-static'
  size?: number
  onUpload?: (file: File, logoType: string) => void
  logoType?: string
}

const LogoContainer = styled('div')({
  position: 'relative',
  display: 'inline-block'
})

const Logo = styled(MuiLogo)<CustomLogoProps>(({ skin, color, size = 40, theme }) => {
  return {
    ...(color &&
      skin === 'light' && {
        backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
        color: `var(--mui-palette-${color}-main)`
      }),
    ...(color &&
      skin === 'light-static' && {
        backgroundColor: lighten(theme.palette[color as ThemeColor].main, 0.84),
        color: `var(--mui-palette-${color}-main)`
      }),
    ...(color &&
      skin === 'filled' && {
        backgroundColor: `var(--mui-palette-${color}-main)`,
        color: `var(--mui-palette-${color}-contrastText)`
      }),
    height: size, // Apply the height directly
    width: size, // Apply the width directly
    borderRadius: '50%'
  }
})

const Overlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s',
  '&:hover': {
    opacity: 1
  }
})

const CustomLogo = forwardRef<HTMLDivElement, CustomLogoProps>((props: CustomLogoProps, ref) => {
  const { color, skin = 'filled', size, onUpload, src, logoType, ...rest } = props
  const [previewUrl, setPreviewUrl] = useState<string>(src || '')
  const { t } = useTranslation('global')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update preview when src prop changes
  useEffect(() => {
    setPreviewUrl(src || '')
  }, [src])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (logoType) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && logoType) {
      // Create preview URL for immediate display
      const newPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(newPreviewUrl)

      // Pass both file and logoType to parent
      onUpload?.(file, logoType)

      // Cleanup old preview URL
      return () => URL.revokeObjectURL(newPreviewUrl)
    }
  }

  return (
    <LogoContainer>
      <Logo color={color} skin={skin} ref={ref} src={previewUrl} size={size} {...rest}>
        {!previewUrl && (
          <div className='flex flex-col items-center justify-center h-full hover:hidden'>
            <i className='tabler-upload' />
            <Typography variant='body2' className='text-black font-medium text-lg'>
              {t('adminSettings.uploadLogo')}
            </Typography>
          </div>
        )}
      </Logo>
      <Overlay onClick={handleClick}>
        <input
          ref={fileInputRef}
          accept='image/*'
          style={{ display: 'none' }}
          id='logo-upload'
          type='file'
          onChange={handleFileChange}
          onClick={e => e.stopPropagation()}
        />
        <div className='flex flex-col hover:cursor-pointer items-center justify-center p-2 bg-opacity-70 rounded-full'>
          <i className='tabler-upload text-white' />
          <Typography variant='body2' className='text-white font-medium text-lg'>
            {t('adminSettings.uploadLogo')}
          </Typography>
        </div>
      </Overlay>
    </LogoContainer>
  )
})

export default CustomLogo
