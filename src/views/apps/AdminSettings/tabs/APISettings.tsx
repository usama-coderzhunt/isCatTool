'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'
import { getFieldsAndValues } from '@/utils/utility/getFieldsAndValues'
import Typography from '@mui/material/Typography'
import { APITokenSettings } from '@/types/adminSettingsTypes'

const APISettings = () => {
  const { useAPITokenSettings, useUpdateAPITokenSettings, useCreateAPITokenSettings } = useAdminSettingsHook('right')
  const { data: apiTokenSettings, isLoading } = useAPITokenSettings()
  const { mutate: updateAPITokens } = useUpdateAPITokenSettings()
  const { mutate: createAPITokenSettings } = useCreateAPITokenSettings()
  const { t } = useTranslation()

  const [apiTokenForm, setApiTokenForm] = useState<Omit<APITokenSettings, 'id'>>({
    twilio_sid: '',
    twilio_number: '',
    openai_key: '',
    google_api_key: ''
  })
  const [visibleTokens, setVisibleTokens] = useState<String[]>([])

  useEffect(() => {
    if (apiTokenSettings) {
      const formValues = getFieldsAndValues(apiTokenSettings).reduce(
        (acc, field) => {
          acc[field.key] = field.value
          return acc
        },
        {} as Record<string, string>
      )
      setApiTokenForm(formValues as Omit<APITokenSettings, 'id'>)
    }
  }, [apiTokenSettings])

  const toggleTokens = (label: string) => {
    setVisibleTokens(current =>
      current.includes(label) ? current.filter(token => token !== label) : [...current, label]
    )
  }

  const handleSave = async () => {
    if (apiTokenSettings?.id) {
      await updateAPITokens({
        id: apiTokenSettings.id,
        ...apiTokenForm
      })
    } else {
      await createAPITokenSettings(apiTokenForm)
    }
  }

  const handleDiscard = () => {
    if (apiTokenSettings) {
      const formValues = getFieldsAndValues(apiTokenSettings).reduce(
        (acc, field) => {
          acc[field.key] = field.value
          return acc
        },
        {} as Record<string, string>
      )
      setApiTokenForm(formValues as Omit<APITokenSettings, 'id'>)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.apiTokenSettings')}
      </Typography>
      <div className='flex flex-col gap-4'>
        {getFieldsAndValues(apiTokenSettings).map(field => (
          <CustomTextField
            key={field.key}
            label={field.label}
            value={apiTokenForm[field.key as keyof Omit<APITokenSettings, 'id'>] || ''}
            type={visibleTokens.includes(field.label) ? 'text' : 'password'}
            fullWidth
            onChange={e =>
              setApiTokenForm(prev => ({
                ...prev,
                [field.key as keyof Omit<APITokenSettings, 'id'>]: e.target.value
              }))
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => toggleTokens(field.label)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={!visibleTokens.includes(field.label) ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
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

export default APISettings
