'use client'

// React Imports
import { useState, useCallback } from 'react'
import type { SyntheticEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import CustomTabList from '@/@core/components/mui/TabList'

// View Imports
import GeneralSettings from '@/views/apps/AdminSettings/tabs/GeneralSettings'
import LogoSettings from '@/views/apps/AdminSettings/tabs/LogoSettings'
import FinanceSettings from '@/views/apps/AdminSettings/tabs/FinanceSettings'
import APISettings from '@/views/apps/AdminSettings/tabs/APISettings'
import SocialSettings from '@/views/apps/AdminSettings/tabs/SocialSettings'
import SEOSettings from '@/views/apps/AdminSettings/tabs/SEOSettings'
import FooterSettings from '@/views/apps/AdminSettings/tabs/FooterSettings'
import PaymentSettings from '@/views/apps/AdminSettings/tabs/PaymentSettings'
import SocialTrackingSettings from '@/views/apps/AdminSettings/tabs/SocialTrackingSettings'
import CustomCodeSettings from '@/views/apps/AdminSettings/tabs/CustomCodeSettings'

// Translation Import
import { useTranslation } from 'next-i18next'

const Page = () => {
  const [activeTab, setActiveTab] = useState('general')
  const { t } = useTranslation('global')

  // Update tabContentList
  const tabContentList = {
    general: <GeneralSettings />,
    logo: <LogoSettings />,
    finance: <FinanceSettings />,
    api: <APISettings />,
    social: <SocialSettings />,
    socialTracking: <SocialTrackingSettings />,
    seo: <SEOSettings />,
    customCode: <CustomCodeSettings />,
    footer: <FooterSettings />,
    payment: <PaymentSettings />
  }

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <>
      <Typography variant='h3' className='mb-5'>
        {t('adminSettings.title')}
      </Typography>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='sticky top-[7rem]'>
              <CustomTabList orientation='vertical' onChange={handleChange} className='is-full' pill='true'>
                <Tab
                  label={t('adminSettings.generalSettings')}
                  icon={<i className='tabler-settings' />}
                  iconPosition='start'
                  value='general'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.logoSettings')}
                  icon={<i className='tabler-photo' />}
                  iconPosition='start'
                  value='logo'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.financeSettings')}
                  icon={<i className='tabler-currency-dollar' />}
                  iconPosition='start'
                  value='finance'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.apiTokenSettings')}
                  icon={<i className='tabler-api' />}
                  iconPosition='start'
                  value='api'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.socialLinkSettings')}
                  icon={<i className='tabler-share' />}
                  iconPosition='start'
                  value='social'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.socialTrackingSettings')}
                  icon={<i className='tabler-chart-bar' />}
                  iconPosition='start'
                  value='socialTracking'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.seoSettings')}
                  icon={<i className='tabler-search' />}
                  iconPosition='start'
                  value='seo'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.customCodeSettings.title')}
                  icon={<i className='tabler-code' />}
                  iconPosition='start'
                  value='customCode'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.footerSettings')}
                  icon={<i className='tabler-settings-2' />}
                  iconPosition='start'
                  value='footer'
                  className='flex-row justify-start !min-is-full'
                />
                <Tab
                  label={t('adminSettings.paymentSettings')}
                  icon={<i className='tabler-credit-card' />}
                  iconPosition='start'
                  value='payment'
                  className='flex-row justify-start !min-is-full'
                />
              </CustomTabList>
            </div>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <TabPanel value={activeTab} className='p-0'>
                  {tabContentList[activeTab as keyof typeof tabContentList]}
                </TabPanel>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default Page
