'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment
} from '@mui/material'
import CustomLogo from '@/@core/components/mui/LogoUpload'
import { Typography } from '@mui/material'
import DynamicSettingsSection from '@/components/adminSettings/DynamicSettingsSection'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { currencies } from '@/utils/constants/currencies'
import CustomTextField from '@/@core/components/mui/TextField'
import { getFieldsAndValues } from '@/utils/utility/getFieldsAndValues'
import { useLogoStore } from '@/store/logoStore'
import {
  GeneralSettings,
  SocialLinkSettings,
  SEOSettings,
  FooterSettings,
  APITokenSettings,
  PayPalSettings,
  StripeSettings
} from '@/types/adminSettingsTypes'
import { useTemplateStore } from '@/store/templateStore'
import { useSettings } from '@/@core/hooks/useSettings'
import { useTranslation } from 'next-i18next'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import HTMLEditor from '@/components/common/htmlEditor'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import CircularLoader from '@/components/CircularLoader'
const isSuperUser = localStorage.getItem('isSuperUser')
const userRole = getDecryptedLocalStorage('userRole')
const AdminSettingsRightSec = () => {
  const { t } = useTranslation('global')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<String[]>([])

  const {
    useLogoSettings,
    useUpdateLogoSettings,
    useGeneralSettings,
    useUpdateGeneralSettings,
    useCreateGeneralSettings,
    useFinanceSettings,
    useUpdateFinanceSettings,
    useAPITokenSettings,
    useUpdateAPITokenSettings,
    useSocialTrackingSettings,
    useUpdateSocialTrackingSettings,
    useSocialLinkSettings,
    useUpdateSocialLinkSettings,
    useSEOSettings,
    useUpdateSEOSettings,
    useFooterSettings,
    useUpdateFooterSettings,
    usePayPalSettings,
    useUpdatePayPalSettings,
    useStripeSettings,
    useUpdateStripeSettings,
    useManualPaymentSettings,
    useUpdateManualPaymentSettings,
    useCreateLogoSettings,
    useCreateFinanceSettings,
    useCreateAPITokenSettings,
    useCreateSocialTrackingSettings,
    useCreateSocialLinkSettings,
    useCreateSEOSettings,
    useCreatePayPalSettings,
    useCreateStripeSettings,
    useCreateManualPayment,
    useCreateFooterSettings,
    // useDeleteLogoSettings,
    // useDeleteFinanceSettings,
    // useDeleteAPITokenSettings,
    // useDeleteSocialTrackingSettings,
    // useDeleteSocialLinkSettings,
    // useDeleteSEOSettings,
    // useDeletePayPalSettings,
    // useDeleteStripeSettings,
    useDeleteManualPayment
    // useDeleteFooterSettings,
    // useDeleteGeneralSettings
  } = useAdminSettingsHook('right')

  const { selectedLogoType, handleLogoTypeChange, setSelectedLogo } = useLogoStore()

  // Fetch data using hooks
  const { data: logoSettings, isLoading: isLogoLoading } = useLogoSettings()
  const { data: generalSettings, isLoading: isGeneralLoading } = useGeneralSettings()
  const { data: financeSettings, isLoading: isFinanceLoading } = useFinanceSettings()
  const { data: apiTokenSettings, isLoading: isAPITokenLoading } = useAPITokenSettings()
  const { data: socialTrackingSettings, isLoading: isSocialTrackingLoading } = useSocialTrackingSettings()
  const { data: socialLinkSettings, isLoading: isSocialLinkLoading } = useSocialLinkSettings()
  const { data: seoSettings, isLoading: isSEOLoading } = useSEOSettings()
  const { data: footerSettings, isLoading: isFooterLoading } = useFooterSettings()
  const { data: paypalSettings, isLoading: isPayPalLoading } = usePayPalSettings()
  const { data: stripeSettings, isLoading: isStripeLoading } = useStripeSettings()
  const { data: manualPaymentSettings, isLoading: isManualPaymentLoading } = useManualPaymentSettings()

  // Add state for social tracking form
  const [socialTrackingForm, setSocialTrackingForm] = useState({
    google_analytics_code: socialTrackingSettings?.google_analytics_code || '',
    facebook_pixel_code: socialTrackingSettings?.facebook_pixel_code || ''
  })

  // Add new states
  const [socialLinksForm, setSocialLinksForm] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    pinterest: '',
    tiktok: ''
  })

  // Change the SEO form state type and initialization
  const [seoForm, setSeoForm] = useState<Omit<SEOSettings, 'id'>>({
    meta_title: '',
    tagline: '',
    meta_description: '',
    seo_keywords: ''
  })

  // Update footer form state type
  const [footerForm, setFooterForm] = useState<Omit<FooterSettings, 'id'>>({
    copyright_text: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null
  })

  const [currentImage, setCurrentImage] = useState<string>('')

  // Add these state declarations after other states
  const [paypalForm, setPaypalForm] = useState({
    client_id: paypalSettings?.client_id || '',
    client_secret: paypalSettings?.client_secret || '',
    active: paypalSettings?.active || false,
    paypal_mode: paypalSettings?.paypal_mode || 'sandbox',
    paypal_webhook_id: paypalSettings?.paypal_webhook_id || ''
  })

  const [stripeForm, setStripeForm] = useState({
    publish_key: stripeSettings?.publish_key || '',
    secret_key: stripeSettings?.secret_key || '',
    active: stripeSettings?.active || false,
    stripe_mode: stripeSettings?.stripe_mode || 'test',
    stripe_webhook_secret: stripeSettings?.stripe_webhook_secret || '',
    stripe_webhook_url: stripeSettings?.stripe_webhook_url || '',
    stripe_webhook_id: stripeSettings?.stripe_webhook_id || ''
  })

  // Add new state for manual payment form
  const [newManualPayment, setNewManualPayment] = useState({
    name: '',
    instructions: '',
    additional_details: '',
    active: true
  })

  // Add a new state for API token form
  const [apiTokenForm, setApiTokenForm] = useState<Record<string, string>>({})

  // Add a new state for general settings form
  const [generalForm, setGeneralForm] = useState<Omit<GeneralSettings, 'id'>>({
    main_title: { ar: '', en: '', es: '', fr: '' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  // Add these state declarations near the top with other states
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)
  const [selectedMethodName, setSelectedMethodName] = useState('')

  // Add these state declarations near other states
  const [editedMethod, setEditedMethod] = useState<{
    id: number | null
    name: string
    instructions: string
    additional_details: string
  } | null>(null)

  // First, add a new state to track the selected currency
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(financeSettings?.currency_code || currencies[0].code)

  // Create mutations
  const { mutate: createGeneralSettings } = useCreateGeneralSettings()
  const { mutate: createSocialTrackingSettings } = useCreateSocialTrackingSettings()
  const { mutate: createSEOSettings } = useCreateSEOSettings()
  const { mutate: createFooterSettings } = useCreateFooterSettings()
  const { mutate: createPayPalSettings } = useCreatePayPalSettings()
  const { mutate: createStripeSettings } = useCreateStripeSettings()
  const { mutate: createManualPayment } = useCreateManualPayment()
  const { mutate: createSocialLinkSettings } = useCreateSocialLinkSettings()
  const { mutate: createAPITokenSettings } = useCreateAPITokenSettings()
  const { mutate: createLogoSettings } = useCreateLogoSettings()
  const { mutate: createFinanceSettings } = useCreateFinanceSettings()

  // Delete mutations
  // const { mutate: deleteGeneralSettings } = useDeleteGeneralSettings();
  // const { mutate: deleteLogoSettings } = useDeleteLogoSettings();
  // const { mutate: deleteFinanceSettings } = useDeleteFinanceSettings();
  // const { mutate: deleteAPITokenSettings } = useDeleteAPITokenSettings();
  // const { mutate: deleteSocialTrackingSettings } = useDeleteSocialTrackingSettings();
  // const { mutate: deleteSocialLinkSettings } = useDeleteSocialLinkSettings();
  // const { mutate: deleteSEOSettings } = useDeleteSEOSettings();
  // const { mutate: deleteFooterSettings } = useDeleteFooterSettings();
  // const { mutate: deletePayPalSettings } = useDeletePayPalSettings();
  // const { mutate: deleteStripeSettings } = useDeleteStripeSettings();
  const { mutate: deleteManualPayment } = useDeleteManualPayment()
  // Update mutations
  const { mutate: updateLogo, isPending: isUploading } = useUpdateLogoSettings()
  const { mutate: updateGeneral } = useUpdateGeneralSettings()
  const { mutate: updateFinance } = useUpdateFinanceSettings()
  const { mutate: updateAPITokens } = useUpdateAPITokenSettings()
  const { mutate: updateSocialTracking } = useUpdateSocialTrackingSettings()
  const { mutate: updateSocialLink } = useUpdateSocialLinkSettings()
  const { mutate: updateSEO } = useUpdateSEOSettings()
  const { mutate: updateFooter } = useUpdateFooterSettings()
  const { mutate: updatePayPal } = useUpdatePayPalSettings()
  const { mutate: updateStripe } = useUpdateStripeSettings()
  const { mutate: updateManualPayment, isPending: isUpdatingManualPayment } = useUpdateManualPaymentSettings()

  const setTemplateName = useTemplateStore(state => state.setTemplateName)

  // Update state when API data is loaded
  useEffect(() => {
    if (socialTrackingSettings) {
      setSocialTrackingForm({
        google_analytics_code: socialTrackingSettings.google_analytics_code,
        facebook_pixel_code: socialTrackingSettings.facebook_pixel_code
      })
    }
  }, [socialTrackingSettings])

  useEffect(() => {
    if (paypalSettings) {
      setPaypalForm({
        client_id: paypalSettings.client_id,
        client_secret: paypalSettings.client_secret,
        active: paypalSettings.active,
        paypal_mode: paypalSettings.paypal_mode,
        paypal_webhook_id: paypalSettings.paypal_webhook_id
      })
    }
  }, [paypalSettings])
  const { settings } = useSettings()
  const getLogoTypeByMode = (mode: string) => {
    if (mode === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark_logo' : 'light_logo'
    }
    return mode === 'dark' ? 'dark_logo' : 'light_logo'
  }

  useEffect(() => {
    if (logoSettings) {
      const logoMap: Record<string, string> = {
        light_logo: logoSettings.light_logo,
        dark_logo: logoSettings.dark_logo,
        favicon: logoSettings.favicon
      }
      const logoType = getLogoTypeByMode(settings?.mode || 'light')
      setCurrentImage(logoMap[logoType] || '')
    }
  }, [logoSettings, settings.mode])

  useEffect(() => {
    if (stripeSettings) {
      setStripeForm({
        publish_key: stripeSettings.publish_key,
        secret_key: stripeSettings.secret_key,
        active: stripeSettings.active,
        stripe_mode: stripeSettings.stripe_mode,
        stripe_webhook_secret: stripeSettings.stripe_webhook_secret,
        stripe_webhook_url: stripeSettings.stripe_webhook_url,
        stripe_webhook_id: stripeSettings.stripe_webhook_id
      })
    }
  }, [stripeSettings])

  useEffect(() => {
    if (apiTokenSettings) {
      const formValues = getFieldsAndValues(apiTokenSettings).reduce(
        (acc, field) => {
          acc[field.key] = field.value
          return acc
        },
        {} as Record<string, string>
      )
      setApiTokenForm(formValues)
    }
  }, [apiTokenSettings])

  useEffect(() => {
    if (generalSettings) {
      setGeneralForm({
        main_title: generalSettings.main_title,
        created_at: generalSettings.created_at,
        updated_at: generalSettings.updated_at
      })
    }
  }, [generalSettings])

  useEffect(() => {
    if (seoSettings) {
      setSeoForm({
        meta_title: seoSettings.meta_title,
        tagline: seoSettings.tagline,
        meta_description: seoSettings.meta_description,
        seo_keywords: seoSettings.seo_keywords
      })
    }
  }, [seoSettings])

  useEffect(() => {
    if (footerSettings) {
      setFooterForm({
        copyright_text: footerSettings.copyright_text,
        created_at: footerSettings.created_at,
        updated_at: footerSettings.updated_at,
        created_by: footerSettings.created_by,
        updated_by: footerSettings.updated_by
      })
    }
  }, [footerSettings])

  useEffect(() => {
    if (socialLinkSettings) {
      setSocialLinksForm({
        facebook: socialLinkSettings?.facebook,
        instagram: socialLinkSettings?.instagram,
        twitter: socialLinkSettings?.twitter,
        linkedin: socialLinkSettings?.linkedin,
        youtube: socialLinkSettings?.youtube,
        pinterest: socialLinkSettings?.pinterest,
        tiktok: socialLinkSettings?.tiktok
      })
    }
  }, [socialLinkSettings])

  useEffect(() => {
    if (generalSettings?.main_title) {
      setTemplateName(generalSettings?.main_title as any)
    }

    if (logoSettings) {
      setSelectedLogo(logoSettings)
    }
  }, [generalSettings])

  // Add useEffect to update selectedCurrencyCode when financeSettings changes
  useEffect(() => {
    if (financeSettings?.currency_code) {
      setSelectedCurrencyCode(financeSettings.currency_code)
    }
  }, [financeSettings])

  const handleSectionToggle = (sectionTitle: string) => {
    setExpandedSection(current => (current === sectionTitle ? null : sectionTitle))
  }

  // Modify the handleCurrencyChange function to only update the local state
  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrencyCode(currencyCode)
  }

  const handleSaveSocialTracking = () => {
    if (socialTrackingSettings?.id) {
      updateSocialTracking({
        id: socialTrackingSettings.id,
        ...socialTrackingForm
      })
    }
  }

  const handleSaveSocialLinks = () => {
    if (socialLinkSettings?.id) {
      updateSocialLink({
        id: socialLinkSettings.id,
        ...socialLinksForm
      })
    }
  }

  const handleSavePayPal = () => {
    if (paypalSettings?.id) {
      updatePayPal({
        id: paypalSettings.id,
        ...paypalForm
      })
    }
  }

  const handleSaveStripe = () => {
    if (stripeSettings?.id) {
      updateStripe({
        id: stripeSettings.id,
        ...stripeForm
      })
    }
  }

  const SocialLinkField = ({
    platform,
    imageType
  }: {
    platform: keyof Pick<
      SocialLinkSettings,
      'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'pinterest' | 'tiktok'
    >
    imageType: string
  }) => {
    // Add ref for file input
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSocialLinksForm(prev => ({
        ...prev,
        [platform]: value
      }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && socialLinkSettings?.id) {
        const formData = new FormData()
        formData.append(imageType, file)
        updateSocialLink({
          id: socialLinkSettings.id,
          formData
        })
      }
    }

    // Add click handler for the container
    const handleUploadClick = () => {
      fileInputRef.current?.click()
    }

    return (
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex gap-4 items-center'>
          <div
            className='relative w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center overflow-hidden group cursor-pointer'
            onClick={handleUploadClick}
          >
            {socialLinkSettings?.[imageType as keyof SocialLinkSettings] ? (
              <img
                src={socialLinkSettings[imageType as keyof SocialLinkSettings] as string}
                alt={`${platform} icon`}
                className='w-full h-full object-contain'
              />
            ) : (
              <span className='text-gray-400'>No image</span>
            )}
            <input ref={fileInputRef} accept='image/*' className='hidden' type='file' onChange={handleFileChange} />
            <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
              <span className='text-white text-sm'>Upload</span>
            </div>
          </div>
          <CustomTextField
            label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
            value={socialLinksForm[platform] || ''}
            type='text'
            fullWidth
            variant='outlined'
            onChange={handleChange}
          />
        </div>
      </div>
    )
  }

  // Helper function to determine if settings exist
  const settingsExist = {
    general: generalSettings?.id !== undefined,
    logo: logoSettings?.id !== undefined,
    finance: financeSettings?.id !== undefined,
    apiToken: apiTokenSettings?.id !== undefined,
    socialTracking: socialTrackingSettings?.id !== undefined,
    socialLink: socialLinkSettings?.id !== undefined,
    seo: seoSettings?.id !== undefined,
    footer: footerSettings?.id !== undefined,
    paypal: paypalSettings?.id !== undefined,
    stripe: stripeSettings?.id !== undefined
  }

  // Show/Hide tokens
  const toggleTokens = (label: string) => {
    if (visibleTokens.includes(label)) {
      const tokens = visibleTokens.filter(token => token !== label)
      setVisibleTokens(tokens)
    } else {
      setVisibleTokens([...visibleTokens, label])
    }
  }
  // Modified settings data structure
  const settingsData = [
    {
      title: t('adminSettings.generalSettings'),
      fields: [
        {
          render: () => (
            <div>
              <CustomTextField
                label={t('adminSettings.mainTitle')}
                value={generalForm.main_title}
                type='text'
                fullWidth
                onChange={e =>
                  setGeneralForm(prev => ({
                    ...prev,
                    main_title: { ar: e.target.value, en: e.target.value, es: e.target.value, fr: e.target.value }
                  }))
                }
              />
              <div className='flex flex-row justify-end w-full'>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (settingsExist.general) {
                      if (generalSettings?.id) {
                        updateGeneral({
                          id: generalSettings.id,
                          ...generalForm
                        })
                      }
                    } else {
                      createGeneralSettings(generalForm)
                    }
                  }}
                  disabled={isGeneralLoading}
                  sx={{ mt: 2 }}
                >
                  {settingsExist.general ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                  {t('adminSettings.generalSettings')}
                </Button>
                {/* {settingsExist.general && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (generalSettings?.id) {
                      deleteGeneralSettings(generalSettings.id);
                    }
                  }}
                  disabled={isGeneralLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.generalSettings')}
                </Button>
              )} */}
              </div>
            </div>
          )
        }
      ],
      isLoading: isGeneralLoading
    },
    {
      title: t('adminSettings.logoSettings'),
      fields: [
        {
          render: () => (
            <div className='overflow-y-auto hide-scrollbar w-full'>
              <div className='flex flex-row justify-between w-full p-2 gap-2'>
                <span
                  className={`cursor-pointer flex flex-col items-center gap-2 p-1 rounded-lg ${selectedLogoType === 'light_logo' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleLogoTypeChange('light_logo')}
                >
                  <CustomLogo
                    variant='rounded'
                    size={200}
                    src={logoSettings?.light_logo}
                    sx={{
                      '& .MuiAvatar-img': {
                        objectFit: 'none'
                      },
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <Typography variant='h6'>{t('adminSettings.lightLogo')}</Typography>
                </span>
                <span
                  className={`cursor-pointer flex flex-col items-center gap-2 p-0 rounded-lg ${selectedLogoType === 'dark_logo' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleLogoTypeChange('dark_logo')}
                >
                  <CustomLogo
                    variant='rounded'
                    size={200}
                    src={logoSettings?.dark_logo}
                    sx={{
                      '& .MuiAvatar-img': {
                        objectFit: 'none'
                      },
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <Typography variant='h6'>{t('adminSettings.darkLogo')}</Typography>
                </span>
                <span
                  className={`cursor-pointer flex flex-col items-center gap-2 p-1 rounded-lg ${selectedLogoType === 'favicon' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleLogoTypeChange('favicon')}
                >
                  <CustomLogo
                    variant='rounded'
                    size={200}
                    src={logoSettings?.favicon}
                    sx={{
                      '& .MuiAvatar-img': {
                        objectFit: 'none'
                      },
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <Typography variant='h6'>{t('adminSettings.favicon')}</Typography>
                </span>
              </div>
            </div>
          )
        }
      ],
      isLoading: isLogoLoading
    },
    {
      title: t('adminSettings.financeSettings'),
      fields: [
        {
          render: () => {
            const currentCurrency = currencies.find(c => c.code === selectedCurrencyCode) || currencies[0]

            return (
              <div>
                <FormControl fullWidth>
                  <InputLabel>{t('adminSettings.selectCurrency')}</InputLabel>
                  <Select
                    value={selectedCurrencyCode}
                    label={t('adminSettings.selectCurrency')}
                    onChange={e => handleCurrencyChange(e.target.value)}
                    disabled={isFinanceLoading}
                  >
                    {currencies.map(currency => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol}) - {currency.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div className='flex flex-row justify-end w-full'>
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (settingsExist.finance) {
                        if (financeSettings?.id) {
                          updateFinance({
                            id: financeSettings.id,
                            currency_code: currentCurrency.code,
                            currency_name: currentCurrency.name,
                            currency_symbol: currentCurrency.symbol
                          })
                        }
                      } else {
                        createFinanceSettings({
                          currency_code: currentCurrency.code,
                          currency_name: currentCurrency.name,
                          currency_symbol: currentCurrency.symbol
                        })
                      }
                    }}
                    disabled={isFinanceLoading}
                    sx={{ mt: 2 }}
                  >
                    {settingsExist.finance ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                    {t('adminSettings.financeSettings')}
                  </Button>

                  {/* {settingsExist.finance && (
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => {
                      if (financeSettings?.id) {
                        deleteFinanceSettings(financeSettings.id);
                      }
                    }}
                    disabled={isFinanceLoading}
                    sx={{ mt: 2 }}
                  >
                    {t('adminSettings.buttons.delete')} {t('adminSettings.financeSettings')}
                  </Button>
                )} */}
                </div>
              </div>
            )
          }
        }
      ],
      isLoading: isFinanceLoading
    },
    {
      title: t('adminSettings.apiTokenSettings'),
      fields: [
        {
          render: () => (
            <div className='flex flex-col gap-4'>
              {getFieldsAndValues(apiTokenSettings).map(field => (
                <CustomTextField
                  key={field.key}
                  disabled={userRole !== 'Admin'}
                  label={field.label}
                  value={apiTokenForm[field.key] || ''}
                  type={visibleTokens.includes(field.label) ? 'text' : 'password'}
                  fullWidth
                  onChange={e =>
                    setApiTokenForm(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={() => {
                              toggleTokens(field.label)
                            }}
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
              <div className='flex flex-row justify-end w-full'>
                {userRole === 'Admin' && (
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (settingsExist.apiToken) {
                        if (apiTokenSettings?.id) {
                          updateAPITokens({
                            id: apiTokenSettings.id,
                            ...apiTokenForm
                          })
                        }
                      } else {
                        createAPITokenSettings(apiTokenForm as Omit<APITokenSettings, 'id'>)
                      }
                    }}
                    disabled={isAPITokenLoading}
                    sx={{ mt: 2 }}
                  >
                    {settingsExist.apiToken ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                    {t('adminSettings.apiTokenSettings')}
                  </Button>
                )}
                {/* {settingsExist.apiToken && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (apiTokenSettings?.id) {
                      deleteAPITokenSettings(apiTokenSettings.id);
                    }
                  }}
                  disabled={isAPITokenLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.apiTokenSettings')}
                </Button>
              )} */}
              </div>
            </div>
          )
        }
      ],
      isLoading: isAPITokenLoading
    },
    {
      title: t('adminSettings.socialTrackingSettings'),
      fields: [
        {
          render: () => (
            <div className='flex flex-col gap-4'>
              <CustomTextField
                label={t('adminSettings.googleAnalyticsPixelCode')}
                value={socialTrackingForm.google_analytics_code}
                type='text'
                fullWidth
                onChange={e =>
                  setSocialTrackingForm(prev => ({
                    ...prev,
                    google_analytics_code: e.target.value
                  }))
                }
              />
              <CustomTextField
                label={t('adminSettings.facebookPixelCode')}
                value={socialTrackingForm.facebook_pixel_code}
                type='text'
                fullWidth
                onChange={e =>
                  setSocialTrackingForm(prev => ({
                    ...prev,
                    facebook_pixel_code: e.target.value
                  }))
                }
              />
              <div className='flex flex-row justify-end w-full'>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (settingsExist.socialTracking) {
                      handleSaveSocialTracking()
                    } else {
                      createSocialTrackingSettings(socialTrackingForm)
                    }
                  }}
                  disabled={isSocialTrackingLoading}
                  sx={{ mt: 2 }}
                >
                  {settingsExist.socialTracking ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                  {t('adminSettings.socialTrackingSettings')}
                </Button>
                {/* {settingsExist.socialTracking && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (socialTrackingSettings?.id) {
                      deleteSocialTrackingSettings(socialTrackingSettings.id);
                    }
                  }}
                  disabled={isSocialTrackingLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.socialTrackingSettings')}
                </Button>
              )} */}
              </div>
            </div>
          )
        }
      ],
      isLoading: isSocialTrackingLoading
    },
    {
      title: t('adminSettings.socialLinkSettings'),
      fields: [
        {
          render: () => (
            <div className='flex flex-col gap-4'>
              <SocialLinkField platform='facebook' imageType='facebook_image' />
              <SocialLinkField platform='instagram' imageType='instagram_image' />
              <SocialLinkField platform='twitter' imageType='twitter_image' />
              <SocialLinkField platform='linkedin' imageType='linkedin_image' />
              <SocialLinkField platform='youtube' imageType='youtube_image' />
              <SocialLinkField platform='pinterest' imageType='pinterest_image' />
              <SocialLinkField platform='tiktok' imageType='tik_tok_image' />
              <div className='flex flex-row justify-end w-full'>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (settingsExist.socialLink) {
                      handleSaveSocialLinks()
                    } else {
                      createSocialLinkSettings(socialLinksForm as Omit<SocialLinkSettings, 'id'>)
                    }
                  }}
                  disabled={isSocialLinkLoading}
                  sx={{ mt: 2 }}
                >
                  {settingsExist.socialLink ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                  {t('adminSettings.socialLinkSettings')}
                </Button>
                {/* {settingsExist.socialLink && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (socialLinkSettings?.id) {
                      deleteSocialLinkSettings(socialLinkSettings.id);
                    }
                  }}
                  disabled={isSocialLinkLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.socialLinkSettings')}
                </Button>
              )} */}
              </div>
            </div>
          )
        }
      ],
      isLoading: isSocialLinkLoading
    },
    {
      title: t('adminSettings.seoSettings'),
      fields: [
        {
          render: () => (
            <div className='flex flex-col gap-4'>
              <CustomTextField
                disabled={userRole !== 'Admin'}
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
                disabled={userRole !== 'Admin'}
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
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.metaDescription')}
                value={seoForm.meta_description}
                type='text'
                fullWidth
                onChange={e =>
                  setSeoForm(prev => ({
                    ...prev,
                    meta_description: e.target.value
                  }))
                }
              />
              <CustomTextField
                disabled={userRole !== 'Admin'}
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
              {userRole === 'Admin' && (
                <div className='flex flex-row justify-end w-full'>
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (settingsExist.seo) {
                        if (seoSettings?.id) {
                          updateSEO({
                            id: seoSettings.id,
                            ...seoForm
                          })
                        }
                      } else {
                        createSEOSettings(seoForm as Omit<SEOSettings, 'id'>)
                      }
                    }}
                    disabled={isSEOLoading}
                    sx={{ mt: 2 }}
                  >
                    {settingsExist.seo ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                    {t('adminSettings.seoSettings')}
                  </Button>
                  {/* {settingsExist.seo && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (seoSettings?.id) {
                      deleteSEOSettings(seoSettings.id);
                    }
                  }}
                  disabled={isSEOLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.seoSettings')}
                </Button>
              )} */}
                </div>
              )}
            </div>
          )
        }
      ],
      isLoading: isSEOLoading
    },
    {
      title: t('adminSettings.footerSettings'),
      fields: [
        {
          render: () => (
            <div>
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.copyrightText')}
                value={footerForm.copyright_text}
                type='text'
                fullWidth
                onChange={e =>
                  setFooterForm(prev => ({
                    ...prev,
                    copyright_text: e.target.value
                  }))
                }
              />
              {userRole === 'Admin' && (
                <div className='flex flex-row justify-end w-full'>
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (settingsExist.footer) {
                        if (footerSettings?.id) {
                          updateFooter({
                            id: footerSettings.id,
                            ...footerForm
                          })
                        }
                      } else {
                        createFooterSettings(footerForm as Omit<FooterSettings, 'id'>)
                      }
                    }}
                    disabled={isFooterLoading}
                    sx={{ mt: 2 }}
                  >
                    {settingsExist.footer ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                    {t('adminSettings.footerSettings')}
                  </Button>
                  {/* {settingsExist.footer && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (footerSettings?.id) {
                      deleteFooterSettings(footerSettings.id);
                    }
                  }}
                  disabled={isFooterLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.footerSettings')}
                </Button>
              )} */}
                </div>
              )}
            </div>
          )
        }
      ],
      isLoading: isFooterLoading
    },
    {
      title: t('adminSettings.paymentSettings'),
      fields: [
        {
          label: t('adminSettings.paypalSettings'),
          render: () => (
            <div className='flex flex-col gap-4 border p-4 rounded-lg shadow-sm'>
              <Typography variant='h6'>{t('adminSettings.paypalConfiguration')}</Typography>
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.clientId')}
                value={paypalForm.client_id}
                fullWidth
                onChange={e => setPaypalForm(prev => ({ ...prev, client_id: e.target.value }))}
              />
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.clientSecret')}
                value={paypalForm.client_secret}
                fullWidth
                onChange={e =>
                  setPaypalForm(prev => ({
                    ...prev,
                    client_secret: e.target.value
                  }))
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={userRole !== 'Admin'}
                    checked={paypalForm.active}
                    onChange={e => setPaypalForm(prev => ({ ...prev, active: e.target.checked }))}
                  />
                }
                label={t('adminSettings.enablePayPal')}
              />
              <FormControl fullWidth>
                <InputLabel>{t('adminSettings.mode')}</InputLabel>
                <Select
                  disabled={userRole !== 'Admin'}
                  value={paypalForm.paypal_mode}
                  label={t('adminSettings.mode')}
                  onChange={e =>
                    setPaypalForm(prev => ({
                      ...prev,
                      paypal_mode: e.target.value as 'sandbox' | 'live'
                    }))
                  }
                >
                  <MenuItem value='sandbox'>{t('adminSettings.sandbox')}</MenuItem>
                  <MenuItem value='live'>{t('adminSettings.live')}</MenuItem>
                </Select>
              </FormControl>
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.webhookId')}
                value={paypalForm.paypal_webhook_id}
                fullWidth
                onChange={e => setPaypalForm(prev => ({ ...prev, paypal_webhook_id: e.target.value }))}
              />
              {userRole === 'Admin' && (
                <div className='flex flex-row justify-end w-full'>
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (settingsExist.paypal) {
                        handleSavePayPal()
                      } else {
                        createPayPalSettings(paypalForm as Omit<PayPalSettings, 'id'>)
                      }
                    }}
                    disabled={isPayPalLoading}
                    sx={{ mt: 2 }}
                  >
                    {settingsExist.paypal ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                    {t('adminSettings.paypalSettings')}
                  </Button>

                  {/* {settingsExist.paypal && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (paypalSettings?.id) {
                      deletePayPalSettings(paypalSettings.id);
                    }
                  }}
                  disabled={isPayPalLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.paypalSettings')}
                </Button>
              )} */}
                </div>
              )}
            </div>
          )
        },
        {
          label: t('adminSettings.stripeSettings'),
          render: () => (
            <div className='flex flex-col gap-4 border p-4 rounded-lg shadow-sm'>
              <Typography variant='h6'>{t('adminSettings.stripeConfiguration')}</Typography>
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.publishableKey')}
                value={stripeForm.publish_key}
                fullWidth
                onChange={e => setStripeForm(prev => ({ ...prev, publish_key: e.target.value }))}
              />
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.secretKey')}
                value={stripeForm.secret_key}
                fullWidth
                onChange={e =>
                  setStripeForm(prev => ({
                    ...prev,
                    secret_key: e.target.value
                  }))
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={userRole !== 'Admin'}
                    checked={stripeForm.active}
                    onChange={e => setStripeForm(prev => ({ ...prev, active: e.target.checked }))}
                  />
                }
                label={t('adminSettings.enableStripe')}
              />
              <FormControl fullWidth>
                <InputLabel>{t('adminSettings.mode')}</InputLabel>
                <Select
                  disabled={userRole !== 'Admin'}
                  value={stripeForm.stripe_mode}
                  label={t('adminSettings.mode')}
                  onChange={e =>
                    setStripeForm(prev => ({
                      ...prev,
                      stripe_mode: e.target.value as 'test' | 'live'
                    }))
                  }
                >
                  <MenuItem value='test'>{t('adminSettings.test')}</MenuItem>
                  <MenuItem value='live'>{t('adminSettings.live')}</MenuItem>
                </Select>
              </FormControl>
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.webhookSecret')}
                value={stripeForm.stripe_webhook_secret}
                fullWidth
                onChange={e =>
                  setStripeForm(prev => ({
                    ...prev,
                    stripe_webhook_secret: e.target.value
                  }))
                }
              />
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.webhookUrl')}
                value={stripeForm.stripe_webhook_url}
                fullWidth
                onChange={e => setStripeForm(prev => ({ ...prev, stripe_webhook_url: e.target.value }))}
              />
              <CustomTextField
                disabled={userRole !== 'Admin'}
                label={t('adminSettings.webhookId')}
                value={stripeForm.stripe_webhook_id}
                fullWidth
                onChange={e => setStripeForm(prev => ({ ...prev, stripe_webhook_id: e.target.value }))}
              />
              {userRole === 'Admin' && (
                <div className='flex flex-row justify-end w-full'>
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (settingsExist.stripe) {
                        handleSaveStripe()
                      } else {
                        createStripeSettings(stripeForm as Omit<StripeSettings, 'id'>)
                      }
                    }}
                    disabled={isStripeLoading}
                    sx={{ mt: 2 }}
                  >
                    {settingsExist.stripe ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}{' '}
                    {t('adminSettings.stripeSettings')}
                  </Button>
                  {/* {settingsExist.stripe && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (stripeSettings?.id) {
                      deleteStripeSettings(stripeSettings.id);
                    }
                  }}
                  disabled={isStripeLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.stripeSettings')}
                </Button>
              )} */}
                </div>
              )}
            </div>
          )
        },
        {
          label: t('adminSettings.manualPayment.title'),
          render: () => (
            <div className='flex flex-col gap-4 border p-4 rounded-lg shadow-sm'>
              <Typography variant='h6'>{t('adminSettings.manualPayment.availableMethods')}</Typography>
              {manualPaymentSettings?.map(method => (
                <div key={method.id} className='border p-4 rounded-lg'>
                  <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-4 w-full'>
                      <CustomTextField
                        disabled={userRole !== 'Admin'}
                        label={t('adminSettings.manualPayment.name')}
                        value={editedMethod?.id === method.id ? editedMethod.name : method.name}
                        type='text'
                        fullWidth
                        onChange={e =>
                          setEditedMethod({
                            id: method.id,
                            name: e.target.value,
                            instructions:
                              editedMethod?.id === method.id ? editedMethod.instructions : method.instructions,
                            additional_details:
                              editedMethod?.id === method.id
                                ? editedMethod.additional_details
                                : method.additional_details
                          })
                        }
                      />
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {t('adminSettings.manualPayment.instructions')}
                        </label>
                        <HTMLEditor
                          value={editedMethod?.id === method.id ? editedMethod.instructions : method.instructions}
                          onChange={(value: string) =>
                            setEditedMethod({
                              id: method.id,
                              name: editedMethod?.id === method.id ? editedMethod.name : method.name,
                              instructions: value,
                              additional_details:
                                editedMethod?.id === method.id
                                  ? editedMethod.additional_details
                                  : method.additional_details
                            })
                          }
                          disabled={userRole !== 'Admin'}
                          height='150px'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {t('adminSettings.manualPayment.additionalDetails')}
                        </label>
                        <HTMLEditor
                          value={
                            editedMethod?.id === method.id ? editedMethod.additional_details : method.additional_details
                          }
                          onChange={(value: string) =>
                            setEditedMethod({
                              id: method.id,
                              name: editedMethod?.id === method.id ? editedMethod.name : method.name,
                              instructions:
                                editedMethod?.id === method.id ? editedMethod.instructions : method.instructions,
                              additional_details: value
                            })
                          }
                          disabled={userRole !== 'Admin'}
                          height='150px'
                        />
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center'>
                      <div className='flex gap-2 order-2 sm:order-1 mt-2'>
                        <Button
                          variant='outlined'
                          onClick={() => setEditedMethod(null)}
                          disabled={isUpdatingManualPayment}
                        >
                          {t('adminSettings.manualPayment.revertChanges')}
                        </Button>
                        <Button
                          variant='contained'
                          onClick={() => {
                            updateManualPayment({
                              id: method.id,
                              name: editedMethod?.id === method.id ? editedMethod.name : method.name,
                              instructions:
                                editedMethod?.id === method.id ? editedMethod.instructions : method.instructions,
                              additional_details:
                                editedMethod?.id === method.id
                                  ? editedMethod.additional_details
                                  : method.additional_details
                            })
                            setEditedMethod(null)
                          }}
                          disabled={isUpdatingManualPayment}
                        >
                          {isUpdatingManualPayment ? (
                            <CircularLoader size={20} />
                          ) : (
                            t('adminSettings.manualPayment.save')
                          )}
                        </Button>
                      </div>

                      <div className='flex items-center gap-2 order-1 sm:order-2'>
                        <FormControlLabel
                          control={
                            <Switch
                              disabled={userRole !== 'Admin'}
                              checked={method.active}
                              onChange={e =>
                                updateManualPayment({
                                  id: method.id,
                                  active: e.target.checked
                                })
                              }
                            />
                          }
                          label={
                            method.active
                              ? t('adminSettings.manualPayment.enabled')
                              : t('adminSettings.manualPayment.disabled')
                          }
                          labelPlacement='start'
                        />
                        <IconButton
                          className='tabler-trash text-red-500 hover:text-red-600'
                          onClick={() => {
                            setSelectedMethodId(method.id)
                            setSelectedMethodName(method.name)
                            setOpenDeleteModal(true)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className='mt-4 border-t pt-4'>
                <Typography variant='h6'>{t('adminSettings.manualPayment.addNew')}</Typography>
                <div className='flex flex-col gap-4 mt-2'>
                  <CustomTextField
                    disabled={userRole !== 'Admin'}
                    label={t('adminSettings.manualPayment.name')}
                    value={newManualPayment.name}
                    fullWidth
                    onChange={e =>
                      setNewManualPayment(prev => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                  />
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      {t('adminSettings.manualPayment.instructions')}
                    </label>
                    <HTMLEditor
                      value={newManualPayment.instructions}
                      onChange={(value: string) =>
                        setNewManualPayment(prev => ({
                          ...prev,
                          instructions: value
                        }))
                      }
                      disabled={userRole !== 'Admin'}
                      height='150px'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      {t('adminSettings.manualPayment.additionalDetails')}
                    </label>
                    <HTMLEditor
                      value={newManualPayment.additional_details}
                      onChange={(value: string) =>
                        setNewManualPayment(prev => ({
                          ...prev,
                          additional_details: value
                        }))
                      }
                      disabled={userRole !== 'Admin'}
                      height='150px'
                    />
                  </div>
                  {userRole === 'Admin' && (
                    <Button
                      variant='contained'
                      onClick={() => {
                        createManualPayment(newManualPayment)
                        setNewManualPayment({ name: '', instructions: '', additional_details: '', active: true })
                      }}
                      disabled={!newManualPayment.name || !newManualPayment.instructions}
                    >
                      {t('adminSettings.buttons.addPaymentMethod')}
                    </Button>
                  )}
                </div>
              </div>
              <DeleteConfModal
                title={t('modal.confirmation.delete.title')}
                deleteValue={selectedMethodName}
                open={openDeleteModal}
                handleClose={() => {
                  setOpenDeleteModal(false)
                  setSelectedMethodId(null)
                  setSelectedMethodName('')
                }}
                handleDelete={() => {
                  if (selectedMethodId) {
                    deleteManualPayment({ id: selectedMethodId })
                    setOpenDeleteModal(false)
                    setSelectedMethodId(null)
                    setSelectedMethodName('')
                  }
                }}
              />
            </div>
          )
        }
      ],
      isLoading: isPayPalLoading || isStripeLoading || isManualPaymentLoading
    }
  ]

  return (
    <Card className='p-5 h-screen overflow-y-auto hide-scrollbar'>
      {settingsData.map((section, index) => (
        <DynamicSettingsSection
          key={index}
          title={section.title}
          fields={section.fields}
          isExpanded={expandedSection === section.title}
          onToggle={() => handleSectionToggle(section.title)}
          isLoading={section.isLoading}
        />
      ))}
    </Card>
  )
}

export default AdminSettingsRightSec
