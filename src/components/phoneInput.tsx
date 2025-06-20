import React from 'react'
import { MuiTelInput } from 'mui-tel-input'

interface PhoneInputProps {
    initialPhoneNumber: string | null;
    onPhoneNumberChange: (newValue: string) => void;
    label: string;
    error: boolean;
    helperText: string | undefined;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    showAsterisk?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
    initialPhoneNumber,
    onPhoneNumberChange,
    label,
    error,
    helperText,
    onBlur,
    showAsterisk
}) => {
    const [value, setValue] = React.useState(initialPhoneNumber || '');

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onPhoneNumberChange(newValue);
    };

    return (
        <MuiTelInput
            fullWidth
            value={value}
            onChange={handleChange}
            label={label}
            error={error}
            helperText={helperText}
            onBlur={onBlur}
            InputLabelProps={{
                required: showAsterisk,
                shrink: true,
                sx: {
                    transform: 'translate(14px, -6px) scale(0.8) !important',
                    '& .MuiInputLabel-asterisk': {
                        color: 'error.main'
                    }
                }
            }}
            sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                    '& legend': {
                        maxWidth: '100%'
                    }
                }
            }}
        />
    );
};

export default PhoneInput;
