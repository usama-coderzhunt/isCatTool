import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import dayjs from 'dayjs'

interface CustomDatePickerProps<T extends FieldValues> {
  label: string
  name: Path<T>
  control: Control<T>
  error?: boolean
  helperText?: string
  defaultValue?: string
  fullWidth?: boolean
  disabled?: boolean
}

const CustomDatePicker = <T extends FieldValues>({
  label,
  name,
  control,
  error,
  helperText,
  defaultValue,
  fullWidth = true,
  disabled
}: CustomDatePickerProps<T>) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue ? dayjs(defaultValue) as any : undefined}
        render={({ field: { onChange, value } }) => (
          <DatePicker
            label={label}
            value={value ? dayjs(value) : null}
            onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : null)}
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
                  style: { borderRadius: '6px' },
                },
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  )
}

export default CustomDatePicker
