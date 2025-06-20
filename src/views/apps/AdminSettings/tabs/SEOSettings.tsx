'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import Button from '@mui/material/Button'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'
import type { SEOSettings as SEOSettingsType } from '@/types/adminSettingsTypes'
import Typography from '@mui/material/Typography'

const SEOSettings = () => {
  const { useSEOSettings, useUpdateSEOSettings, useCreateSEOSettings } = useAdminSettingsHook('right')
  const { data: seoSettings, isLoading } = useSEOSettings()
  const { mutate: updateSEO } = useUpdateSEOSettings()
  const { mutate: createSEO } = useCreateSEOSettings()
  const { t } = useTranslation()

  const [seoForm, setSeoForm] = useState<Omit<SEOSettingsType, 'id'>>({
    meta_title: '',
    tagline: '',
    meta_description: '',
    seo_keywords: ''
  })

  useEffect(() => {
    if (seoSettings) {
      setSeoForm({
        meta_title: seoSettings.meta_title || '',
        tagline: seoSettings.tagline || '',
        meta_description: seoSettings.meta_description || '',
        seo_keywords: seoSettings.seo_keywords || ''
      })
    }
  }, [seoSettings])

  const handleSave = async () => {
    if (seoSettings?.id) {
      await updateSEO({
        id: seoSettings.id,
        ...seoForm
      })
    } else {
      await createSEO(seoForm)
    }
  }

  const handleDiscard = () => {
    if (seoSettings) {
      setSeoForm({
        meta_title: seoSettings.meta_title || '',
        tagline: seoSettings.tagline || '',
        meta_description: seoSettings.meta_description || '',
        seo_keywords: seoSettings.seo_keywords || ''
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.seoSettings')}
      </Typography>
      <div className='flex flex-col gap-4'>
        <CustomTextField
          label={t('adminSettings.metaTitle')}
          value={seoForm.meta_title}
          type='text'
          fullWidth
          onChange={e =>
            setSeoForm(prev => ({
              ...prev,
              meta_title: e.target.value
            }))
          }
        />
        <CustomTextField
          label={t('adminSettings.tagline')}
          value={seoForm.tagline}
          type='text'
          fullWidth
          onChange={e =>
            setSeoForm(prev => ({
              ...prev,
              tagline: e.target.value
            }))
          }
        />
        <CustomTextField
          label={t('adminSettings.metaDescription')}
          value={seoForm.meta_description}
          multiline
          rows={4}
          fullWidth
          onChange={e =>
            setSeoForm(prev => ({
              ...prev,
              meta_description: e.target.value
            }))
          }
        />
        <CustomTextField
          label={t('adminSettings.seoKeywords')}
          value={seoForm.seo_keywords}
          type='text'
          fullWidth
          onChange={e =>
            setSeoForm(prev => ({
              ...prev,
              seo_keywords: e.target.value
            }))
          }
        />
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

export default SEOSettings
