'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CustomTextField from '@/@core/components/mui/TextField'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Typography from '@mui/material/Typography'
import HTMLEditor from '@/components/common/htmlEditor'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTranslation } from 'react-i18next'
import type { PaymentSettings as PaymentSettingsType } from '@/types/adminSettingsTypes'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

const PaymentSettings = () => {
  const {
    usePayPalSettings,
    useUpdatePayPalSettings,
    useCreatePayPalSettings,
    useStripeSettings,
    useUpdateStripeSettings,
    useCreateStripeSettings,
    useManualPaymentSettings,
    useUpdateManualPaymentSettings,
    useCreateManualPayment,
    useDeleteManualPayment
  } = useAdminSettingsHook('right')

  // PayPal hooks
  const { data: paypalSettings, isLoading: isPayPalLoading } = usePayPalSettings()
  const { mutate: updatePayPal } = useUpdatePayPalSettings()
  const { mutate: createPayPalSettings } = useCreatePayPalSettings()

  // Stripe hooks
  const { data: stripeSettings, isLoading: isStripeLoading } = useStripeSettings()
  const { mutate: updateStripe } = useUpdateStripeSettings()
  const { mutate: createStripeSettings } = useCreateStripeSettings()

  // Manual Payment hooks
  const { data: manualPaymentSettings, isLoading: isManualPaymentLoading } = useManualPaymentSettings()
  const { mutate: updateManualPayment, isPending: isUpdatingManualPayment } = useUpdateManualPaymentSettings()
  const { mutate: createManualPayment } = useCreateManualPayment()
  const { mutate: deleteManualPayment } = useDeleteManualPayment()

  // Form states
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

  const [newManualPayment, setNewManualPayment] = useState({
    name: '',
    instructions: '',
    active: true,
    additional_details: ''
  })

  // Add state for existing manual payment methods
  const [editedMethod, setEditedMethod] = useState<{
    id: number | null
    name: string
    instructions: string
    active: boolean
    additional_details: string
  } | null>(null)

  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)
  const [selectedMethodName, setSelectedMethodName] = useState('')

  // Add state for password visibility
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({
    paypal_secret: false,
    stripe_secret: false,
    webhook_secret: false
  })

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Update form states when data is loaded
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

  // Save handlers
  const handleSavePayPal = () => {
    if (paypalSettings?.id) {
      updatePayPal({
        id: paypalSettings.id,
        ...paypalForm
      })
    } else {
      createPayPalSettings(paypalForm)
    }
  }

  const handleSaveStripe = () => {
    if (stripeSettings?.id) {
      updateStripe({
        id: stripeSettings.id,
        ...stripeForm
      })
    } else {
      createStripeSettings(stripeForm)
    }
  }

  const { t } = useTranslation()

  if (isPayPalLoading || isStripeLoading || isManualPaymentLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      {/* PayPal Section */}
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.paymentSettings')}
      </Typography>
      <div className='flex flex-col gap-4 border p-4 rounded-lg shadow-sm mb-6'>
        <Typography variant='h6'>{t('adminSettings.paypalConfiguration')}</Typography>
        <CustomTextField
          label={t('adminSettings.clientId')}
          value={paypalForm.client_id}
          onChange={e => setPaypalForm(prev => ({ ...prev, client_id: e.target.value }))}
          fullWidth
        />
        <CustomTextField
          label={t('adminSettings.clientSecret')}
          value={paypalForm.client_secret}
          onChange={e => setPaypalForm(prev => ({ ...prev, client_secret: e.target.value }))}
          fullWidth
          type={showSecrets.paypal_secret ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton edge='end' onClick={() => toggleSecretVisibility('paypal_secret')}>
                  <i
                    className={`tabler-chevron-down text-base ${showSecrets.paypal_secret ? 'tabler-eye' : 'tabler-eye-off'}`}
                  />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={paypalForm.active}
              onChange={e => setPaypalForm(prev => ({ ...prev, active: e.target.checked }))}
            />
          }
          label={t('adminSettings.enablePaypal')}
        />
        <FormControl fullWidth>
          <InputLabel>{t('adminSettings.mode')}</InputLabel>
          <Select
            value={paypalForm.paypal_mode}
            label={t('adminSettings.mode')}
            onChange={e => setPaypalForm(prev => ({ ...prev, paypal_mode: e.target.value as 'sandbox' | 'live' }))}
          >
            <MenuItem value='sandbox'>{t('adminSettings.sandbox')}</MenuItem>
            <MenuItem value='live'>{t('adminSettings.live')}</MenuItem>
          </Select>
        </FormControl>
        <CustomTextField
          label={t('adminSettings.webhookId')}
          value={paypalForm.paypal_webhook_id}
          onChange={e => setPaypalForm(prev => ({ ...prev, paypal_webhook_id: e.target.value }))}
          fullWidth
        />
        <div className='flex justify-end'>
          <Button
            variant='contained'
            onClick={() => {
              if (paypalSettings?.id) {
                updatePayPal({
                  id: paypalSettings.id,
                  ...paypalForm
                })
              } else {
                createPayPalSettings(paypalForm)
              }
            }}
          >
            {paypalSettings?.id ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}
          </Button>
        </div>
      </div>

      {/* Stripe Section */}
      <div className='flex flex-col gap-4 border p-4 rounded-lg shadow-sm mb-6'>
        <Typography variant='h6'>{t('adminSettings.stripeConfiguration')}</Typography>
        <CustomTextField
          label={t('adminSettings.publishableKey')}
          value={stripeForm.publish_key}
          onChange={e => setStripeForm(prev => ({ ...prev, publish_key: e.target.value }))}
          fullWidth
        />
        <CustomTextField
          label={t('adminSettings.secretKey')}
          value={stripeForm.secret_key}
          onChange={e => setStripeForm(prev => ({ ...prev, secret_key: e.target.value }))}
          fullWidth
          type={showSecrets.stripe_secret ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton edge='end' onClick={() => toggleSecretVisibility('stripe_secret')}>
                  <i
                    className={`tabler-chevron-down text-base ${showSecrets.stripe_secret ? 'tabler-eye' : 'tabler-eye-off'}`}
                  />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={stripeForm.active}
              onChange={e => setStripeForm(prev => ({ ...prev, active: e.target.checked }))}
            />
          }
          label={t('adminSettings.enableStripe')}
        />
        <FormControl fullWidth>
          <InputLabel>{t('adminSettings.mode')}</InputLabel>
          <Select
            value={stripeForm.stripe_mode}
            label={t('adminSettings.mode')}
            onChange={e => setStripeForm(prev => ({ ...prev, stripe_mode: e.target.value as 'test' | 'live' }))}
          >
            <MenuItem value='test'>{t('adminSettings.test')}</MenuItem>
            <MenuItem value='live'>{t('adminSettings.live')}</MenuItem>
          </Select>
        </FormControl>
        <CustomTextField
          label={t('adminSettings.webhookSecret')}
          value={stripeForm.stripe_webhook_secret}
          onChange={e => setStripeForm(prev => ({ ...prev, stripe_webhook_secret: e.target.value }))}
          fullWidth
          type={showSecrets.webhook_secret ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton edge='end' onClick={() => toggleSecretVisibility('webhook_secret')}>
                  <i
                    className={`tabler-chevron-down text-base ${showSecrets.webhook_secret ? 'tabler-eye' : 'tabler-eye-off'}`}
                  />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <CustomTextField
          label={t('adminSettings.webhookUrl')}
          value={stripeForm.stripe_webhook_url}
          onChange={e => setStripeForm(prev => ({ ...prev, stripe_webhook_url: e.target.value }))}
          fullWidth
        />
        <CustomTextField
          label={t('adminSettings.webhookId')}
          value={stripeForm.stripe_webhook_id}
          onChange={e => setStripeForm(prev => ({ ...prev, stripe_webhook_id: e.target.value }))}
          fullWidth
        />
        <div className='flex justify-end'>
          <Button
            variant='contained'
            onClick={() => {
              if (stripeSettings?.id) {
                updateStripe({
                  id: stripeSettings.id,
                  ...stripeForm
                })
              } else {
                createStripeSettings(stripeForm)
              }
            }}
          >
            {stripeSettings?.id ? t('adminSettings.buttons.update') : t('adminSettings.buttons.create')}
          </Button>
        </div>
      </div>

      {/* Manual Payment Section */}
      <div className='flex flex-col gap-4 border p-4 rounded-lg shadow-sm'>
        <Typography variant='h6'>{t('adminSettings.manualPayment.title')}</Typography>

        {/* Existing Manual Payment Methods */}
        {manualPaymentSettings?.map(method => (
          <div key={method.id} className='border p-4 rounded-lg'>
            <div className='flex flex-col gap-4'>
              <CustomTextField
                label={t('adminSettings.manualPayment.name')}
                value={editedMethod?.id === method.id ? editedMethod.name : method.name}
                onChange={e =>
                  setEditedMethod({
                    id: method.id,
                    name: e.target.value,
                    instructions: editedMethod?.id === method.id ? editedMethod.instructions : method.instructions,
                    active: editedMethod?.id === method.id ? editedMethod.active : method.active,
                    additional_details:
                      editedMethod?.id === method.id ? editedMethod.additional_details : method.additional_details
                  })
                }
                fullWidth
              />
              <div>
                <Typography className='block text-sm mb-2'>{t('adminSettings.manualPayment.instructions')}</Typography>
                <HTMLEditor
                  value={editedMethod?.id === method.id ? editedMethod.instructions : method.instructions}
                  onChange={(value: string) =>
                    setEditedMethod({
                      id: method.id,
                      name: editedMethod?.id === method.id ? editedMethod.name : method.name,
                      instructions: value,
                      active: editedMethod?.id === method.id ? editedMethod.active : method.active,
                      additional_details:
                        editedMethod?.id === method.id ? editedMethod.additional_details : method.additional_details
                    })
                  }
                  height='150px'
                />
              </div>
              <div>
                <Typography className='block text-sm mb-2'>
                  {t('adminSettings.manualPayment.additionalDetails')}
                </Typography>
                <HTMLEditor
                  value={editedMethod?.id === method.id ? editedMethod.additional_details : method.additional_details}
                  onChange={(value: string) =>
                    setEditedMethod({
                      id: method.id,
                      name: editedMethod?.id === method.id ? editedMethod.name : method.name,
                      instructions: editedMethod?.id === method.id ? editedMethod.instructions : method.instructions,
                      active: editedMethod?.id === method.id ? editedMethod.active : method.active,
                      additional_details: value
                    })
                  }
                  height='150px'
                />
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex gap-2'>
                  <Button variant='outlined' onClick={() => setEditedMethod(null)}>
                    {t('adminSettings.manualPayment.revertChanges')}
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => {
                      updateManualPayment({
                        id: method.id,
                        name: editedMethod?.id === method.id ? editedMethod.name : method.name,
                        instructions: editedMethod?.id === method.id ? editedMethod.instructions : method.instructions,
                        active: editedMethod?.id === method.id ? editedMethod.active : method.active,
                        additional_details:
                          editedMethod?.id === method.id ? editedMethod.additional_details : method.additional_details
                      })
                      setEditedMethod(null)
                    }}
                  >
                    {t('adminSettings.manualPayment.save')}
                  </Button>
                </div>
                <div className='flex items-center gap-2'>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedMethod?.id === method.id ? editedMethod.active : method.active}
                        onChange={e =>
                          setEditedMethod({
                            id: method.id,
                            name: editedMethod?.id === method.id ? editedMethod.name : method.name,
                            instructions:
                              editedMethod?.id === method.id ? editedMethod.instructions : method.instructions,
                            active: e.target.checked,
                            additional_details:
                              editedMethod?.id === method.id
                                ? editedMethod.additional_details
                                : method.additional_details
                          })
                        }
                      />
                    }
                    label={
                      (editedMethod?.id === method.id ? editedMethod.active : method.active)
                        ? t('adminSettings.manualPayment.enabled')
                        : t('adminSettings.manualPayment.disabled')
                    }
                  />
                  <IconButton
                    className='text-red-500 hover:text-red-600'
                    onClick={() => {
                      setSelectedMethodId(method.id)
                      setSelectedMethodName(method.name)
                      setOpenDeleteModal(true)
                    }}
                  >
                    <i className='tabler-trash' />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Manual Payment Method */}
        <div className='mt-4 border-t pt-4'>
          <Typography variant='h6'>{t('adminSettings.manualPayment.addNew')}</Typography>
          <div className='flex flex-col gap-4 mt-2'>
            <CustomTextField
              label={t('adminSettings.manualPayment.name')}
              value={newManualPayment.name}
              onChange={e => setNewManualPayment(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <div>
              <div className='flex items-center '>
                <Typography className='block text-sm mb-2'>{t('adminSettings.manualPayment.instructions')}</Typography>
                <i className='tabler-asterisk text-red-500 text-xs -mt-2' />
              </div>
              <HTMLEditor
                value={newManualPayment.instructions}
                onChange={(value: string) => setNewManualPayment(prev => ({ ...prev, instructions: value }))}
                height='150px'
              />
            </div>
            <div>
              <Typography className='block text-sm mb-2'>
                {t('adminSettings.manualPayment.additionalDetails')}
              </Typography>
              <HTMLEditor
                value={newManualPayment.additional_details}
                onChange={(value: string) => setNewManualPayment(prev => ({ ...prev, additional_details: value }))}
                height='150px'
              />
            </div>
            <Button
              variant='contained'
              onClick={() => {
                createManualPayment(newManualPayment)
                setNewManualPayment({ name: '', instructions: '', active: true, additional_details: '' })
              }}
              disabled={!newManualPayment.name || !newManualPayment.instructions}
            >
              {t('adminSettings.buttons.addPaymentMethod')}
            </Button>
          </div>
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
    </Card>
  )
}

export default PaymentSettings
