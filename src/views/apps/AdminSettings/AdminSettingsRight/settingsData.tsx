import { useTranslation } from 'next-i18next';
import CustomTextField from '@/@core/components/mui/TextField';
import { Button, FormControl, InputLabel, MenuItem, Select, FormControlLabel, Switch } from '@mui/material';
import { GeneralSettings, SocialLinkSettings, SEOSettings, FooterSettings, APITokenSettings, PayPalSettings, StripeSettings } from '@/types/adminSettingsTypes';

const { t } = useTranslation('global')
export const settingsData = [
    {
      title: t('adminSettings.generalSettings'),
      fields: [
        {
          render: () => (
            <div>
              <CustomTextField
                label={t('adminSettings.mainTitle')}
                value={generalForm.main_title}
                type="text"
                fullWidth
                onChange={(e) => setGeneralForm(prev => ({ 
                  ...prev, 
                  main_title: e.target.value 
                }))}
              />
              <div className='flex flex-row justify-end w-full'>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (settingsExist.general) {
                    if (generalSettings?.id) {
                      updateGeneral({
                        id: generalSettings.id,
                        ...generalForm
                      });
                    }
                  } else {
                    createGeneralSettings(generalForm);
                  }
                }}
                disabled={isGeneralLoading}
                sx={{ mt: 2}}
              >
                {settingsExist.general ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.generalSettings')}
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
              <div className="flex flex-row justify-between w-full p-2 gap-2">
                <span className={`cursor-pointer flex flex-col items-center gap-2 p-1 rounded-lg ${selectedLogoType === 'light_logo' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleLogoTypeChange('light_logo')}>  
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
                <span className={`cursor-pointer flex flex-col items-center gap-2 p-0 rounded-lg ${selectedLogoType === 'dark_logo' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleLogoTypeChange('dark_logo')}>  
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
                <span className={`cursor-pointer flex flex-col items-center gap-2 p-1 rounded-lg ${selectedLogoType === 'favicon' ? 'ring-2 ring-primary' : ''}`} onClick={() => handleLogoTypeChange('favicon')}>  
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
              {/* {settingsExist.logo && (
                <div className='flex flex-row justify-end w-full'>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (logoSettings?.id) {
                      deleteLogoSettings(logoSettings.id);
                    }
                  }}
                  disabled={isLogoLoading}
                  sx={{ mt: 2 }}
                >
                  {t('adminSettings.buttons.delete')} {t('adminSettings.logoSettings')}
                </Button>
                </div>
              )} */}
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
            const currentSettings = financeSettings;
            const currentCurrency = currencies.find(c => 
              c.code === currentSettings?.currency_code || 
              c.symbol === currentSettings?.currency_code
            ) || currencies[0];

            return (
              <div>
                <FormControl fullWidth>
                  <InputLabel>{t('adminSettings.selectCurrency')}</InputLabel>
                  <Select
                    value={currentCurrency.code}
                    label={t('adminSettings.selectCurrency')}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    disabled={isFinanceLoading}
                  >
                    {currencies.map((currency) => (
                      <MenuItem 
                        key={currency.code} 
                        value={currency.code}
                      >
                        {currency.name} ({currency.symbol}) - {currency.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div className='flex flex-row justify-end w-full'> 
                <Button
                  variant="contained"
                  onClick={() => {
                    if (settingsExist.finance) {
                      if (financeSettings?.id) {
                        updateFinance({
                          id: financeSettings.id,
                          currency_code: currentCurrency.code
                        });
                      }
                    } else {
                      createFinanceSettings({
                        currency_code: currentCurrency.code,
                        currency_name: currentCurrency.name,
                        currency_symbol: currentCurrency.symbol,
                      });
                    }
                  }}
                  disabled={isFinanceLoading}
                  sx={{ mt: 2 }}
                >
                  {settingsExist.finance ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.financeSettings')}
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
            );
          }
        }
      ],
      isLoading: isFinanceLoading
    },
    {
      title: 'API Token Settings',
      fields: [
        {
          render: () => (
            <div className='flex flex-col gap-4'>
              {getFieldsAndValues(apiTokenSettings).map(field => (
                <CustomTextField
                  key={field.key}
                  label={field.label}
                  value={apiTokenForm[field.key] || ''}
                  type={'text'}
                  fullWidth
                  onChange={(e) => setApiTokenForm(prev => ({ 
                    ...prev, 
                    [field.key]: e.target.value 
                  }))}
                />
              ))}
              <div className='flex flex-row justify-end w-full'>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (settingsExist.apiToken) {
                    if (apiTokenSettings?.id) {
                      updateAPITokens({
                        id: apiTokenSettings.id,
                        ...apiTokenForm
                      });
                    }
                  } else {
                    createAPITokenSettings(apiTokenForm as Omit<APITokenSettings, 'id'>);
                  }
                }}
                disabled={isAPITokenLoading}
                sx={{ mt: 2 }}
              >
                {settingsExist.apiToken ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.apiTokenSettings')}
              </Button>
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
                type="text"
                fullWidth
                onChange={(e) => setSocialTrackingForm(prev => ({ 
                  ...prev, 
                  google_analytics_code: e.target.value 
                }))}
              />
              <CustomTextField
                label={t('adminSettings.facebookPixelCode')}
                value={socialTrackingForm.facebook_pixel_code}
                type="text"
                fullWidth
                onChange={(e) => setSocialTrackingForm(prev => ({
                  ...prev,
                  facebook_pixel_code: e.target.value
                }))}
              />
              <div className='flex flex-row justify-end w-full'>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (settingsExist.socialTracking) {
                    handleSaveSocialTracking();
                  } else {
                    createSocialTrackingSettings(socialTrackingForm);
                  }
                }}
                disabled={isSocialTrackingLoading}
                sx={{ mt: 2 }}
              >
                {settingsExist.socialTracking ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.socialTrackingSettings')}
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
              <SocialLinkField platform="facebook" imageType="facebook_image" />
              <SocialLinkField platform="instagram" imageType="instagram_image" />
              <SocialLinkField platform="twitter" imageType="twitter_image" />
              <SocialLinkField platform="linkedin" imageType="linkedin_image" />
              <SocialLinkField platform="youtube" imageType="youtube_image" />
              <SocialLinkField platform="pinterest" imageType="pinterest_image" />
              <SocialLinkField platform="tiktok" imageType="tik_tok_image" />
              <div className='flex flex-row justify-end w-full'>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (settingsExist.socialLink) {
                    handleSaveSocialLinks();
                  } else {
                    createSocialLinkSettings(socialLinksForm as Omit<SocialLinkSettings, 'id'>);
                  }
                }}
                disabled={isSocialLinkLoading}
                sx={{ mt: 2 }}
              >
                {settingsExist.socialLink ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.socialLinkSettings')}
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
                label={t('adminSettings.metaTitle')}
                value={seoForm.meta_title}
                type="text"
                fullWidth
                onChange={(e) => setSeoForm(prev => ({ 
                  ...prev, 
                  meta_title: e.target.value 
                }))}
              />
              <CustomTextField
                label={t('adminSettings.tagline')}
                value={seoForm.tagline}
                type="text"
                fullWidth
                onChange={(e) => setSeoForm(prev => ({ 
                  ...prev, 
                  tagline: e.target.value 
                }))}
              />
              <CustomTextField
                label={t('adminSettings.metaDescription')}
                value={seoForm.meta_description}
                type="text"
                fullWidth
                onChange={(e) => setSeoForm(prev => ({ 
                  ...prev, 
                  meta_description: e.target.value 
                }))}
              />
              <CustomTextField
                label={t('adminSettings.seoKeywords')}
                value={seoForm.seo_keywords}
                type="text"
                fullWidth
                onChange={(e) => setSeoForm(prev => ({ 
                  ...prev, 
                  seo_keywords: e.target.value 
                }))}
              />
              <div className='flex flex-row justify-end w-full'>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (settingsExist.seo) {
                    if (seoSettings?.id) {
                      updateSEO({
                        id: seoSettings.id,
                        ...seoForm
                      });
                    }
                  } else {
                    createSEOSettings(seoForm as Omit<SEOSettings, 'id'>);
                  }
                }}
                disabled={isSEOLoading}
                sx={{ mt: 2 }}
              >
                {settingsExist.seo ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.seoSettings')}
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
                label={t('adminSettings.copyrightText')}
                value={footerForm.copyright_text}
                type="text"
                fullWidth
                onChange={(e) => setFooterForm(prev => ({ 
                  ...prev, 
                  copyright_text: e.target.value 
                }))}
              />
              <div className='flex flex-row justify-end w-full'>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (settingsExist.footer) {
                    if (footerSettings?.id) {
                      updateFooter({
                        id: footerSettings.id,
                        ...footerForm
                      });
                    }
                  } else {
                    createFooterSettings(footerForm as Omit<FooterSettings, 'id'>);
                  }
                }}
                disabled={isFooterLoading}
                sx={{ mt: 2 }}
              >
                {settingsExist.footer ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.footerSettings')}
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
            <div className="flex flex-col gap-4 border p-4 rounded-lg shadow-sm">
              <Typography variant="h6">{t('adminSettings.paypalConfiguration')}</Typography>
              <CustomTextField
                label={t('adminSettings.clientId')}
                value={paypalForm.client_id}
                fullWidth
                onChange={(e) => setPaypalForm(prev => ({ ...prev, client_id: e.target.value }))}
              />
              <CustomTextField
                label={t('adminSettings.clientSecret')}
                value={paypalForm.client_secret}
                fullWidth
                onChange={(e) => setPaypalForm(prev => ({ 
                  ...prev, 
                  client_secret: e.target.value 
                }))}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={paypalForm.active}
                    onChange={(e) => setPaypalForm(prev => ({ ...prev, active: e.target.checked }))}
                  />
                }
                label={t('adminSettings.enablePayPal')}
              />
              <FormControl fullWidth>
                <InputLabel>{t('adminSettings.mode')}</InputLabel>
                <Select
                  value={paypalForm.paypal_mode}
                  label={t('adminSettings.mode')}
                  onChange={(e) => setPaypalForm(prev => ({ 
                    ...prev, 
                    paypal_mode: e.target.value as 'sandbox' | 'live' 
                  }))}
                >
                  <MenuItem value="sandbox">{t('adminSettings.sandbox')}</MenuItem>
                  <MenuItem value="live">{t('adminSettings.live')}</MenuItem>
                </Select>
              </FormControl>
              <CustomTextField
                label={t('adminSettings.webhookId')}
                value={paypalForm.paypal_webhook_id}
                fullWidth
                onChange={(e) => setPaypalForm(prev => ({ ...prev, paypal_webhook_id: e.target.value }))}
              />
              <div className='flex flex-row justify-end w-full'>
              <Button
                variant="contained"
                onClick={() => {
                  if (settingsExist.paypal) {
                    handleSavePayPal();
                  } else {
                    createPayPalSettings(paypalForm as Omit<PayPalSettings, 'id'>);
                  }
                }}
                disabled={isPayPalLoading}
                sx={{ mt: 2 }}
              >
                {settingsExist.paypal ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.paypalSettings')}
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
            </div>
          )
        },
        {
          label: t('adminSettings.stripeSettings'),
          render: () => (
            <div className="flex flex-col gap-4 border p-4 rounded-lg shadow-sm">
              <Typography variant="h6">{t('adminSettings.stripeConfiguration')}</Typography>
              <CustomTextField
                label={t('adminSettings.publishableKey')}
                value={stripeForm.publish_key}
                fullWidth
                onChange={(e) => setStripeForm(prev => ({ ...prev, publish_key: e.target.value }))}
              />
              <CustomTextField
                label={t('adminSettings.secretKey')}
                value={stripeForm.secret_key}
                fullWidth
                onChange={(e) => setStripeForm(prev => ({ 
                  ...prev, 
                  secret_key: e.target.value 
                }))}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={stripeForm.active}
                    onChange={(e) => setStripeForm(prev => ({ ...prev, active: e.target.checked }))}
                  />
                }
                label={t('adminSettings.enableStripe')}
              />
              <FormControl fullWidth>
                <InputLabel>{t('adminSettings.mode')}</InputLabel>
                <Select
                  value={stripeForm.stripe_mode}
                  label={t('adminSettings.mode')}
                  onChange={(e) => setStripeForm(prev => ({ 
                    ...prev, 
                    stripe_mode: e.target.value as 'test' | 'live' 
                  }))}
                >
                  <MenuItem value="test">{t('adminSettings.test')}</MenuItem>
                  <MenuItem value="live">{t('adminSettings.live')}</MenuItem>
                </Select>
              </FormControl>
              <CustomTextField
                label={t('adminSettings.webhookSecret')}
                value={stripeForm.stripe_webhook_secret}
                fullWidth
                onChange={(e) => setStripeForm(prev => ({ 
                  ...prev, 
                  stripe_webhook_secret: e.target.value 
                }))}
              />
              <CustomTextField
                label={t('adminSettings.webhookUrl')}
                value={stripeForm.stripe_webhook_url}
                fullWidth
                onChange={(e) => setStripeForm(prev => ({ ...prev, stripe_webhook_url: e.target.value }))}
              />
              <CustomTextField
                label={t('adminSettings.webhookId')}
                value={stripeForm.stripe_webhook_id}
                fullWidth
                onChange={(e) => setStripeForm(prev => ({ ...prev, stripe_webhook_id: e.target.value }))}
              />
              <div className='flex flex-row justify-end w-full'>
              <Button
                variant="contained"
                onClick={() => {
                  if (settingsExist.stripe) {
                    handleSaveStripe();
                  } else {
                    createStripeSettings(stripeForm as Omit<StripeSettings, 'id'>);
                  }
                }}
                disabled={isStripeLoading}
                sx={{ mt: 2 }}
              >
                {settingsExist.stripe ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')} {t('adminSettings.stripeSettings')}
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
            </div>
          )
        },
        {
          label: t('adminSettings.manualPayment.title'),
          render: () => (
            <div className="flex flex-col gap-4 border p-4 rounded-lg shadow-sm">
              <Typography variant="h6">{t('adminSettings.manualPayment.availableMethods')}</Typography>
              {manualPaymentSettings?.map((method) => (
                <div key={method.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <Typography variant="subtitle1">{method.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {method.instructions}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={method.active}
                            onChange={(e) => updateManualPayment({ 
                              id: method.id, 
                              active: e.target.checked 
                            })}
                          />
                        }
                        label={method.active ? t('adminSettings.manualPayment.enabled') : t('adminSettings.manualPayment.disabled')}
                        labelPlacement="start"
                      />
                      <IconButton className='tabler-trash text-red-500 hover:text-red-600' onClick={() => deleteManualPayment({ id: method.id })} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 border-t pt-4">
                <Typography variant="h6">{t('adminSettings.manualPayment.addNew')}</Typography>
                <div className="flex flex-col gap-4 mt-2">
                  <CustomTextField
                    label={t('adminSettings.manualPayment.name')}
                    value={newManualPayment.name}
                    fullWidth
                    onChange={(e) => setNewManualPayment(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                  />
                  <CustomTextField
                    label={t('adminSettings.manualPayment.instructions')}
                    value={newManualPayment.instructions}
                    fullWidth
                    multiline
                    rows={3}
                    onChange={(e) => setNewManualPayment(prev => ({ 
                      ...prev, 
                      instructions: e.target.value 
                    }))}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      createManualPayment(newManualPayment);
                      setNewManualPayment({ name: '', instructions: '', active: true });
                    }}
                    disabled={!newManualPayment.name || !newManualPayment.instructions}
                  >
                    {t('adminSettings.buttons.addPaymentMethod')}
                  </Button>
                </div>
              </div>
            </div>
          )
        }
      ],
      isLoading: isPayPalLoading || isStripeLoading || isManualPaymentLoading
    },
  ];
