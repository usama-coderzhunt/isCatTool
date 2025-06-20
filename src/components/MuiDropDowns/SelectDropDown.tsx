import * as React from 'react'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

interface SelectDropDownProps {
  id: string
  label: string
  options: { value: string; label: string }[]
  selectedValue: string // The selected value should be a string
  onValueChange: (value: string) => void
  error?: boolean
  helperText?: string
}

const SelectDropDown: React.FC<SelectDropDownProps> = ({ id, label, options, selectedValue, onValueChange }) => {
  // State to store the selected value locally
  const [localSelectedValue, setLocalSelectedValue] = React.useState(selectedValue)

  // Update local state when selectedValue changes
  React.useEffect(() => {
    setLocalSelectedValue(selectedValue)
  }, [selectedValue])

  const selectedOption = options.find(option => option.value === localSelectedValue)

  const handleSelectChange = (event: any, newValue: any) => {
    // Update the local state when the selection changes
    setLocalSelectedValue(newValue?.value || '')
    onValueChange(newValue?.value || '') // Propagate the value back to the parent
  }

  return (
    <Autocomplete
      id={id}
      sx={{ width: '100%' }}
      options={options}
      autoHighlight
      getOptionLabel={option => option.label}
      disableClearable
      value={selectedOption ?? (null as any)} // Directly use the selected option
      onChange={handleSelectChange}
      renderOption={(props, option) => (
        <Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          {option.label}
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          InputLabelProps={{
            shrink: true
          }}
        />
      )}
    />
  )
}

export default SelectDropDown
