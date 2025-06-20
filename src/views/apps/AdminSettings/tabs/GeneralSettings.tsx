'use client'

// React Imports
import { useEffect, useLayoutEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Hook Imports
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'

// Types
import { GeneralSettings as GeneralSettingsType } from '@/types/adminSettingsTypes'
import { useTemplateStore } from '@/store/templateStore'
import { useParams } from 'next/navigation'

interface MultiLanguageTitle {
  ar: string
  en: string
  es: string
  fr: string
}

const languages = [
  { key: 'en', label: 'English' },
  { key: 'ar', label: 'عربي' },
  { key: 'es', label: 'Español' },
  { key: 'fr', label: 'Français' }
] as const
interface MainTitle {
  [key: string]: string
}

const GeneralSettings = () => {
  const { lang } = useParams()
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const { setTemplateName } = useTemplateStore()
  const { useGeneralSettings, useUpdateGeneralSettings, useCreateGeneralSettings } = useAdminSettingsHook('right')
  const { data: generalSettings, isLoading } = useGeneralSettings()
  const { mutate: updateGeneral, isPending: isUpdating } = useUpdateGeneralSettings()
  const { mutate: createGeneralSettings } = useCreateGeneralSettings()
  const { t } = useTranslation()
  const [generalForm, setGeneralForm] = useState<Omit<GeneralSettingsType, 'id'>>({
    main_title: {
      ar: '',
      en: '',
      es: '',
      fr: ''
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  useLayoutEffect(() => {
    if (generalSettings) {
      setGeneralForm({
        main_title:
          typeof generalSettings.main_title === 'object'
            ? generalSettings.main_title
            : {
                ar: '',
                en: generalSettings.main_title,
                es: '',
                fr: ''
              },
        created_at: generalSettings.created_at,
        updated_at: generalSettings.updated_at
      })
      const title =
        typeof generalSettings.main_title === 'object'
          ? (generalSettings.main_title as MainTitle)[currentLocale as keyof MainTitle] ||
            (generalSettings.main_title as MainTitle).en
          : generalSettings.main_title
      setTemplateName(title || '')
    }
  }, [generalSettings])

  const handleTitleChange = (lang: keyof MultiLanguageTitle, value: string) => {
    setGeneralForm(prev => ({
      ...prev,
      main_title: {
        ...(prev.main_title as MultiLanguageTitle),
        [lang]: value
      }
    }))
  }

  const handleSave = () => {
    if (generalSettings?.id) {
      updateGeneral({
        id: generalSettings.id,
        ...generalForm
      })
    } else {
      createGeneralSettings(generalForm)
    }
  }

  const handleDiscard = () => {
    if (generalSettings) {
      setGeneralForm({
        main_title: generalSettings.main_title,
        created_at: generalSettings.created_at,
        updated_at: generalSettings.updated_at
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.generalSettings')}
      </Typography>

      <div className='flex flex-col gap-5'>
        {languages.map(({ key, label }) => (
          <div key={key} className='col-span-1'>
            <CustomTextField
              label={`${t('adminSettings.mainTitle')} (${label})`}
              value={(generalForm.main_title as MultiLanguageTitle)[key]}
              type='text'
              fullWidth
              onChange={e => handleTitleChange(key as keyof MultiLanguageTitle, e.target.value)}
              disabled={isUpdating}
            />
          </div>
        ))}
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

export default GeneralSettings
