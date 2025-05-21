// src/@core/components/mui/DateTimePicker.tsx

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import dayjs from 'dayjs'

interface CustomDateTimePickerProps<T extends FieldValues> {
  label: string
  name: Path<T>
  control: Control<T>
  error?: boolean
  helperText?: string
  defaultValue?: string
  fullWidth?: boolean
  disabled?: boolean
}

const CustomDateTimePicker = <T extends FieldValues>({
  label,
  name,
  control,
  error,
  helperText,
  defaultValue,
  fullWidth = true,
  disabled
}: CustomDateTimePickerProps<T>) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue ? dayjs(defaultValue) as any : undefined}
        render={({ field: { onChange, value } }) => (
          <DateTimePicker
            label={label}
            value={value ? dayjs(value) : null}
            onChange={(date) => onChange(date ? date.format('YYYY-MM-DD HH:mm:ss') : null)}
            slotProps={{
              textField: {
                fullWidth,
                error,
                helperText,
                disabled: disabled,
                InputLabelProps: {
                  shrink: true,
                },
                InputProps: {
                  disableUnderline: true,
                },
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  )
}

export default CustomDateTimePicker
