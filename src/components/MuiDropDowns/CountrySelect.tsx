import * as React from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

import type { CountrySelectProps } from '@/types/apps/interfaces'

export default function CountrySelect({ onCountryChange, selectedCountry }: CountrySelectProps) {
  const { t } = useTranslation('global')

  return (
    <Autocomplete
      id='country-select-demo'
      sx={{ width: '100%' }}
      options={countries}
      autoHighlight
      getOptionLabel={option => option.label}
      disableClearable
      value={countries.find(c => c.label === selectedCountry) ?? undefined}
      onChange={(event: any, newValue: CountryType | null) => {
        onCountryChange(newValue ? newValue.label : '')
      }}
      renderOption={(props, option) => (
        <Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          {option.label}
        </Box>
      )}
      renderInput={params =>
        <TextField
          {...params}
          label={t('clientModal.fields.country')}
          InputLabelProps={{
            shrink: true,
          }}
        />
      }
    />
  )
}

interface CountryType {
  label: string
}

// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
const countries: readonly CountryType[] = [
  { label: 'Afghanistan' },
  { label: 'Albania' },
  { label: 'Algeria' },
  { label: 'Andorra' },
  { label: 'Angola' },
  { label: 'Antigua and Barbuda' },
  { label: 'Argentina' },
  { label: 'Armenia' },
  { label: 'Australia' },
  { label: 'Austria' },
  { label: 'Azerbaijan' },
  { label: 'Bahamas' },
  { label: 'Bahrain' },
  { label: 'Bangladesh' },
  { label: 'Barbados' },
  { label: 'Belarus' },
  { label: 'Belgium' },
  { label: 'Belize' },
  { label: 'Benin' },
  { label: 'Bhutan' },
  { label: 'Bolivia' },
  { label: 'Bosnia and Herzegovina' },
  { label: 'Botswana' },
  { label: 'Brazil' },
  { label: 'Brunei' },
  { label: 'Bulgaria' },
  { label: 'Burkina Faso' },
  { label: 'Burundi' },
  { label: 'Cabo Verde' },
  { label: 'Cambodia' },
  { label: 'Cameroon' },
  { label: 'Canada' },
  { label: 'Central African Republic' },
  { label: 'Chad' },
  { label: 'Chile' },
  { label: 'China' },
  { label: 'Colombia' },
  { label: 'Comoros' },
  { label: 'Congo, Democratic Republic of the' },
  { label: 'Congo, Republic of the' },
  { label: 'Costa Rica' },
  { label: 'Croatia' },
  { label: 'Cuba' },
  { label: 'Cyprus' },
  { label: 'Czech Republic' },
  { label: 'Denmark' },
  { label: 'Djibouti' },
  { label: 'Dominica' },
  { label: 'Dominican Republic' },
  { label: 'Ecuador' },
  { label: 'Egypt' },
  { label: 'El Salvador' },
  { label: 'Equatorial Guinea' },
  { label: 'Eritrea' },
  { label: 'Estonia' },
  { label: 'Eswatini' },
  { label: 'Ethiopia' },
  { label: 'Fiji' },
  { label: 'Finland' },
  { label: 'France' },
  { label: 'Gabon' },
  { label: 'Gambia' },
  { label: 'Georgia' },
  { label: 'Germany' },
  { label: 'Ghana' },
  { label: 'Greece' },
  { label: 'Grenada' },
  { label: 'Guatemala' },
  { label: 'Guinea' },
  { label: 'Guinea-Bissau' },
  { label: 'Guyana' },
  { label: 'Haiti' },
  { label: 'Honduras' },
  { label: 'Hungary' },
  { label: 'Iceland' },
  { label: 'India' },
  { label: 'Indonesia' },
  { label: 'Iran' },
  { label: 'Iraq' },
  { label: 'Ireland' },
  { label: 'Israel' },
  { label: 'Italy' },
  { label: 'Jamaica' },
  { label: 'Japan' },
  { label: 'Jordan' },
  { label: 'Kazakhstan' },
  { label: 'Kenya' },
  { label: 'Kiribati' },
  { label: 'Korea, North' },
  { label: 'Korea, South' },
  { label: 'Kuwait' },
  { label: 'Kyrgyzstan' },
  { label: 'Laos' },
  { label: 'Latvia' },
  { label: 'Lebanon' },
  { label: 'Lesotho' },
  { label: 'Liberia' },
  { label: 'Libya' },
  { label: 'Liechtenstein' },
  { label: 'Lithuania' },
  { label: 'Luxembourg' },
  { label: 'Madagascar' },
  { label: 'Malawi' },
  { label: 'Malaysia' },
  { label: 'Maldives' },
  { label: 'Mali' },
  { label: 'Malta' },
  { label: 'Marshall Islands' },
  { label: 'Mauritania' },
  { label: 'Mauritius' },
  { label: 'Mexico' },
  { label: 'Micronesia' },
  { label: 'Moldova' },
  { label: 'Monaco' },
  { label: 'Mongolia' },
  { label: 'Montenegro' },
  { label: 'Morocco' },
  { label: 'Mozambique' },
  { label: 'Myanmar' },
  { label: 'Namibia' },
  { label: 'Nauru' },
  { label: 'Nepal' },
  { label: 'Netherlands' },
  { label: 'New Zealand' },
  { label: 'Nicaragua' },
  { label: 'Niger' },
  { label: 'Nigeria' },
  { label: 'North Macedonia' },
  { label: 'Norway' },
  { label: 'Oman' },
  { label: 'Pakistan' },
  { label: 'Palau' },
  { label: 'Palestine' },
  { label: 'Panama' },
  { label: 'Papua New Guinea' },
  { label: 'Paraguay' },
  { label: 'Peru' },
  { label: 'Philippines' },
  { label: 'Poland' },
  { label: 'Portugal' },
  { label: 'Qatar' },
  { label: 'Romania' },
  { label: 'Russia' },
  { label: 'Rwanda' },
  { label: 'Saint Kitts and Nevis' },
  { label: 'Saint Lucia' },
  { label: 'Saint Vincent and the Grenadines' },
  { label: 'Samoa' },
  { label: 'San Marino' },
  { label: 'Sao Tome and Principe' },
  { label: 'Saudi Arabia' },
  { label: 'Senegal' },
  { label: 'Serbia' },
  { label: 'Seychelles' },
  { label: 'Sierra Leone' },
  { label: 'Singapore' },
  { label: 'Slovakia' },
  { label: 'Slovenia' },
  { label: 'Solomon Islands' },
  { label: 'Somalia' },
  { label: 'South Africa' },
  { label: 'South Sudan' },
  { label: 'Spain' },
  { label: 'Sri Lanka' },
  { label: 'Sudan' },
  { label: 'Suriname' },
  { label: 'Sweden' },
  { label: 'Switzerland' },
  { label: 'Syria' },
  { label: 'Taiwan' },
  { label: 'Tajikistan' },
  { label: 'Tanzania' },
  { label: 'Thailand' },
  { label: 'Timor-Leste' },
  { label: 'Togo' },
  { label: 'Tonga' },
  { label: 'Trinidad and Tobago' },
  { label: 'Tunisia' },
  { label: 'Turkey' },
  { label: 'Turkmenistan' },
  { label: 'Tuvalu' },
  { label: 'Uganda' },
  { label: 'Ukraine' },
  { label: 'United Arab Emirates' },
  { label: 'United Kingdom' },
  { label: 'United States' },
  { label: 'Uruguay' },
  { label: 'Uzbekistan' },
  { label: 'Vanuatu' },
  { label: 'Vatican City' },
  { label: 'Venezuela' },
  { label: 'Vietnam' },
  { label: 'Yemen' },
  { label: 'Zambia' },
  { label: 'Zimbabwe' }
]
