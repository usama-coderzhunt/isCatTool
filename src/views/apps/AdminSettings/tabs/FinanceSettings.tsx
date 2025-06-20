'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { currencies } from '@/utils/constants/currencies'
import { Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const FinanceSettings = () => {
  const { useFinanceSettings, useUpdateFinanceSettings, useCreateFinanceSettings } = useAdminSettingsHook('right')
  const { data: financeSettings, isLoading } = useFinanceSettings()
  const { mutate: updateFinance } = useUpdateFinanceSettings()
  const { mutate: createFinanceSettings } = useCreateFinanceSettings()
  const { t } = useTranslation()

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(financeSettings?.currency_code || currencies[0].code)

  useEffect(() => {
    if (financeSettings?.currency_code) {
      setSelectedCurrencyCode(financeSettings.currency_code)
    }
  }, [financeSettings])

  const handleSave = () => {
    const currentCurrency = currencies.find(c => c.code === selectedCurrencyCode) || currencies[0]

    if (financeSettings?.id) {
      updateFinance({
        id: financeSettings.id,
        currency_code: currentCurrency.code,
        currency_name: currentCurrency.name,
        currency_symbol: currentCurrency.symbol
      })
    } else {
      createFinanceSettings({
        currency_code: currentCurrency.code,
        currency_name: currentCurrency.name,
        currency_symbol: currentCurrency.symbol
      })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card className='p-6'>
      <Typography className='mb-4' variant='h4'>
        {t('adminSettings.financeSettings')}
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Select Currency</InputLabel>
        <Select
          value={selectedCurrencyCode}
          label='Select Currency'
          onChange={e => setSelectedCurrencyCode(e.target.value)}
        >
          {currencies.map(currency => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol}) - {currency.code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className='flex justify-end gap-4 mt-4'>
        <Button variant='contained' onClick={handleSave}>
          {t('adminSettings.saveChanges')}
        </Button>
      </div>
    </Card>
  )
}

export default FinanceSettings
