import React, { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@mui/material/styles'
import { useSettings } from '@core/hooks/useSettings'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
const MAX_FILE_SIZE = 1 * 1024 * 1024

interface ImageUploaderProps {
  onChange: (file: File | null) => void
  value?: File | null | string
  label?: string
  error?: boolean
  helperText?: string
  maxSize?: number
  allowedExtensions?: string[]
  title?: string
  subTitle?: string
  required?: boolean
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onChange,
  value,
  label,
  error,
  helperText,
  maxSize = MAX_FILE_SIZE,
  allowedExtensions = ALLOWED_EXTENSIONS,
  title,
  subTitle,
  required = false
}) => {
  const { t } = useTranslation('global')
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [isHovered, setIsHovered] = useState(false)
  const [validationError, setValidationError] = useState<string | undefined>(undefined)
  const { mode } = useColorScheme()
  const { settings } = useSettings()
  const currentMode = mode === 'system' ? (settings.mode === 'dark' ? 'dark' : 'light') : mode

  useEffect(() => {
    if (value) {
      if (value instanceof File) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(value)
      } else if (typeof value === 'string') {
        setPreviewUrl(value)
      }
    } else {
      setPreviewUrl(undefined)
    }
  }, [value])

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(extension)) {
      setValidationError(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`)
      return false
    }
    if (file.size > maxSize) {
      setValidationError(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`)
      return false
    }
    setValidationError(undefined)
    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (validateFile(file)) {
        onChange(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        // Clear the input if validation fails
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        onChange(null)
        setPreviewUrl(undefined)
      }
    }
  }

  return (
    <div className='w-full'>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${error ? 'text-red-500' : 'text-textPrimary'}`}>
          {label}{' '}
          {required ? (
            <span className='text-red-500'>*</span>
          ) : (
            <span className='text-gray-500'>{`(${t('modal.confirmation.status.optional')})`}</span>
          )}
        </label>
      )}
      <div
        className={`relative group cursor-pointer transition-all duration-300 bg-backgroundPrimary w-full
                    border-2 rounded-lg ${
                      error ? 'border-red-500' : 'border-border hover:border-primary focus-within:border-primary'
                    }`}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input type='file' accept='image/*' ref={inputRef} className='hidden' onChange={handleFileChange} />
        {previewUrl ? (
          <div className='relative h-[200px] overflow-hidden rounded-md'>
            <img src={previewUrl} alt='Preview' className='w-full h-full object-contain bg-backgroundPaper' />
            <div
              className={`absolute inset-0 flex items-center justify-center
                            bg-backgroundPaper/50 backdrop-blur-[1px]
                            transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className='text-textPrimary flex flex-col items-center justify-center text-center transform translate-y-2 group-hover:translate-y-0 transition-transform'>
                <div
                  className='bg-transparent w-8 h-8 rounded-full backdrop-blur-sm mb-2 flex items-center justify-center
                                    group-hover:bg-primary transition-all duration-300'
                >
                  <svg
                    className='w-4 h-4 text-primary group-hover:text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                    />
                  </svg>
                </div>
                <p className='text-sm font-medium text-textPrimary group-hover:text-white'>Click to change image</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`h-[200px] border-2 border-dashed rounded-md 
                        transition-all duration-300 ${
                          currentMode === 'dark'
                            ? ' bg-backgroundPrimary group-hover:bg-backgroundPrimary'
                            : 'border-border bg-gradient-to-b from-backgroundPrimary to-backgroundPrimary group-hover:from-backgroundPrimary group-hover:to-backgroundPrimary'
                        }`}
          >
            <div className='h-full flex flex-col items-center justify-center space-y-3'>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center 
                                transition-all duration-300 ${
                                  currentMode === 'dark'
                                    ? 'bg-primary/20 group-hover:scale-110 group-hover:bg-primary/30'
                                    : 'bg-primary/10 group-hover:scale-110 group-hover:bg-primary/20'
                                }`}
              >
                <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <div className='text-center'>
                <p
                  className={`text-base font-medium mb-1 ${currentMode === 'dark' ? 'text-textPrimary' : 'text-textPrimary'}`}
                >
                  {title ? title : t('imageUploader.selectFile')}
                </p>
                <p className={`text-sm ${currentMode === 'dark' ? 'text-textPrimary' : 'text-textPrimary'}`}>
                  {subTitle ? subTitle : t('imageUploader.dragDrop')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {helperText && <p className={`mt-2 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>{helperText}</p>}
      {validationError && <p className='mt-2 text-sm text-red-500'>{validationError}</p>}
    </div>
  )
}

export default ImageUploader
