'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import Button from '@mui/material/Button'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'
import type { FooterSettings as FooterSettingsType } from '@/types/adminSettingsTypes'
import Typography from '@mui/material/Typography'

const FooterSettings = () => {
  const { useFooterSettings, useUpdateFooterSettings, useCreateFooterSettings } = useAdminSettingsHook('right')
  const { data: footerSettings, isLoading } = useFooterSettings()
  const { mutate: updateFooter } = useUpdateFooterSettings()
  const { mutate: createFooter } = useCreateFooterSettings()
  const { t } = useTranslation()

  const [footerForm, setFooterForm] = useState<Omit<FooterSettingsType, 'id'>>({
    copyright_text: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null
  })

  useEffect(() => {
    if (footerSettings) {
      setFooterForm({
        copyright_text: footerSettings.copyright_text || '',
        created_at: footerSettings.created_at,
        updated_at: footerSettings.updated_at,
        created_by: footerSettings.created_by,
        updated_by: footerSettings.updated_by
      })
    }
  }, [footerSettings])

  const handleSave = async () => {
    if (footerSettings?.id) {
      await updateFooter({
        id: footerSettings.id,
        ...footerForm
      })
    } else {
      await createFooter(footerForm)
    }
  }

  const handleDiscard = () => {
    if (footerSettings) {
      setFooterForm({
        copyright_text: footerSettings.copyright_text || '',
        created_at: footerSettings.created_at,
        updated_at: footerSettings.updated_at,
        created_by: footerSettings.created_by,
        updated_by: footerSettings.updated_by
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.footerSettings')}
      </Typography>
      <div className='flex flex-col gap-4'>
        <CustomTextField
          label={t('adminSettings.copyrightText')}
          value={footerForm.copyright_text}
          onChange={e => setFooterForm(prev => ({ ...prev, copyright_text: e.target.value }))}
          fullWidth
          multiline
          rows={2}
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

export default FooterSettings
