import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from './TextField'

interface CustomAppReactDatepickerProps<T extends FieldValues> {
    label: string
    name: Path<T>
    control: Control<T>
    error?: boolean
    helperText?: string
    defaultValue?: string
    fullWidth?: boolean
    disabled?: boolean
    showTimeSelect?: boolean
    timeFormat?: string
    timeIntervals?: number
    dateFormat?: string
    placeholderText?: string
}

const CustomAppReactDatepicker = <T extends FieldValues>({
    label,
    name,
    control,
    error,
    helperText,
    defaultValue,
    fullWidth = true,
    disabled,
    showTimeSelect,
    timeFormat,
    timeIntervals,
    dateFormat,
    placeholderText
}: CustomAppReactDatepickerProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue as any}
            render={({ field: { onChange, value } }) => (
                <AppReactDatepicker
                    selected={value ? new Date(value) : null}
                    onChange={(date) => onChange(date ? date.toISOString() : null)}
                    showTimeSelect={showTimeSelect}
                    timeFormat={timeFormat}
                    timeIntervals={timeIntervals}
                    dateFormat={dateFormat}
                    placeholderText={placeholderText}
                    disabled={disabled}
                    customInput={
                        <CustomTextField
                            fullWidth={fullWidth}
                            error={error}
                            helperText={helperText}
                            label={label}
                        />
                    }
                />
            )}
        />
    )
}

export default CustomAppReactDatepicker 
