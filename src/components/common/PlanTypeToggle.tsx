import React from 'react'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
interface PlanTypeToggleProps {
  value: 'monthly' | 'yearly'
  onChange: (value: 'monthly' | 'yearly') => void
}

const PlanTypeToggle: React.FC<PlanTypeToggleProps> = ({ value, onChange }) => {
  const { t } = useTranslation('global')
  return (
    <div className='flex bg-surfacePaper rounded-full p-2 w-fit border border-border'>
      <Button
        variant='text'
        className={`rounded-full px-6 py-2 font-semibold transition-all duration-200 shadow-none text-base normal-case ${
          value === 'monthly' ? 'bg-primary text-white shadow' : 'bg-transparent text-gray-500'
        }`}
        onClick={() => onChange('monthly')}
      >
        {t('planTypeToggle.monthly')}
      </Button>
      <Button
        variant='text'
        className={`rounded-full px-6 py-2 font-semibold transition-all duration-200 shadow-none text-base normal-case ${
          value === 'yearly' ? 'bg-primary text-white shadow' : 'bg-transparent text-gray-500'
        }`}
        onClick={() => onChange('yearly')}
      >
        {t('planTypeToggle.yearly')}
      </Button>
    </div>
  )
}

export default PlanTypeToggle
