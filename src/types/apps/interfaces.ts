export interface CountryType {
  label: string
}

export interface CountrySelectProps {
  onCountryChange: (country: string) => void
  selectedCountry: string | undefined
  defaultValue?: CountryType | undefined
}
