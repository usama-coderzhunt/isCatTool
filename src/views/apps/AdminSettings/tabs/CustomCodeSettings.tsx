'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Component Imports
import CodeEditor from '@/@core/components/mui/CodeEditor'

// Hook Imports
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'

// Types
import { CustomCodeSettings as CustomCodeSettingsType } from '@/types/adminSettingsTypes'

const CustomCodeSettings = () => {
  const { useCustomCodeSettings, useUpdateCustomCodeSettings, useCreateCustomCodeSettings } =
    useAdminSettingsHook('right')
  const { data: customCodeSettings, isLoading } = useCustomCodeSettings()
  const { mutate: updateCustomCode, isPending: isUpdating } = useUpdateCustomCodeSettings()
  const { mutate: createCustomCodeSettings } = useCreateCustomCodeSettings()
  const { t } = useTranslation()

  const [customCodeForm, setCustomCodeForm] = useState<
    Omit<CustomCodeSettingsType, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
  >({
    custom_css: '',
    custom_js: '',
    custom_html_header: '',
    custom_html_body: ''
  })

  useEffect(() => {
    if (customCodeSettings) {
      setCustomCodeForm({
        custom_css: customCodeSettings.custom_css || '',
        custom_js: customCodeSettings.custom_js || '',
        custom_html_header: customCodeSettings.custom_html_header || '',
        custom_html_body: customCodeSettings.custom_html_body || ''
      })
    }
  }, [customCodeSettings])

  const handleSave = () => {
    if (customCodeSettings?.id) {
      updateCustomCode({
        id: customCodeSettings.id,
        ...customCodeForm
      })
    } else {
      createCustomCodeSettings(customCodeForm)
    }
  }

  const handleDiscard = () => {
    if (customCodeSettings) {
      setCustomCodeForm({
        custom_css: customCodeSettings.custom_css || '',
        custom_js: customCodeSettings.custom_js || '',
        custom_html_header: customCodeSettings.custom_html_header || '',
        custom_html_body: customCodeSettings.custom_html_body || ''
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.customCodeSettings.title')}
      </Typography>

      <div className='flex flex-col gap-10'>
        <div>
          <CodeEditor
            value={customCodeForm.custom_css}
            onChange={value =>
              setCustomCodeForm(prev => ({
                ...prev,
                custom_css: value
              }))
            }
            disabled={isUpdating}
            language='css'
            label={t('adminSettings.customCodeSettings.customCss')}
            placeholder={t('adminSettings.enterCustomCSS')}
            height='400px'
          />
        </div>

        <div>
          <CodeEditor
            value={customCodeForm.custom_js}
            onChange={value =>
              setCustomCodeForm(prev => ({
                ...prev,
                custom_js: value
              }))
            }
            disabled={isUpdating}
            language='javascript'
            label={t('adminSettings.customCodeSettings.customJs')}
            placeholder={t('adminSettings.enterCustomJS')}
            height='400px'
          />
        </div>

        <div>
          <CodeEditor
            value={customCodeForm.custom_html_header}
            onChange={value =>
              setCustomCodeForm(prev => ({
                ...prev,
                custom_html_header: value
              }))
            }
            disabled={isUpdating}
            language='html'
            label={t('adminSettings.customCodeSettings.customHtmlHeader')}
            placeholder={t('adminSettings.enterCustomHTMLHeader')}
            height='400px'
          />
        </div>

        <div>
          <CodeEditor
            value={customCodeForm.custom_html_body}
            onChange={value =>
              setCustomCodeForm(prev => ({
                ...prev,
                custom_html_body: value
              }))
            }
            disabled={isUpdating}
            language='html'
            label={t('adminSettings.customCodeSettings.customHtmlBody')}
            placeholder={t('adminSettings.customCodeSettings.enterCustomHtmlBody')}
            height='400px'
          />
        </div>
      </div>

      <div className='flex justify-end gap-4 mt-4'>
        <Button variant='tonal' color='secondary' onClick={handleDiscard} disabled={isUpdating}>
          {t('adminSettings.customCodeSettings.buttons.discard')}
        </Button>
        <Button variant='contained' onClick={handleSave} disabled={isUpdating}>
          {t('adminSettings.customCodeSettings.buttons.save')}
        </Button>
      </div>
    </Card>
  )
}

export default CustomCodeSettings
