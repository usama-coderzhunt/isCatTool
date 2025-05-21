'use client'
// MUI Imports
import Grid from '@mui/material/Grid2'


// Component Imports
import AdminSettingsLeft from '@/views/apps/AdminSettings/AdminSettingsLeft/AdminSettingsLeft'
import AdminSettingsRight from '@/views/apps/AdminSettings/AdminSettingsRight/AdminSettingsRight'

// Data Imports
import { Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'

const Page = ()=> {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])
  return (
    <>
    <Typography variant="h3" className='mb-5'>
    {t('adminSettings.title')}
    </Typography>
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <AdminSettingsLeft />
      </Grid>
      <Grid  size={{ xs: 12, lg: 8, md: 7 }}>
        <AdminSettingsRight />
      </Grid>
    </Grid>
    </>
  )
}

export default Page
