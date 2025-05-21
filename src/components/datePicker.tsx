import * as React from 'react';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { FieldError, FieldErrorsImpl, Merge, UseFormRegisterReturn } from 'react-hook-form';

interface DatePickerProps {
    register?: UseFormRegisterReturn;
    resetValue: () => void;
    errorMessage: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
    dateValue: dayjs.Dayjs | null;
    setDateValue: React.Dispatch<React.SetStateAction<dayjs.Dayjs | null>>;
}

const DatePickerCom: React.FC<DatePickerProps> = ({ register, resetValue, errorMessage, dateValue, setDateValue }) => {
    const handleDateChange = (newDate: any) => {
        console.log("Raw newDate:", newDate);

        if (!newDate) {
            console.log("Received null date");
            setDateValue(null);
            
return;
        }

        setDateValue(dayjs(newDate));
        console.log("Updated dateValue:", dayjs(newDate));
    };



    return (
        <div className="w-full flex flex-col gap-2">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Select Date"
                    value={dateValue}
                    onChange={handleDateChange}
                    slotProps={{
                        textField: {
                            ...register,
                            fullWidth: true,
                            variant: "outlined",
                            error: !!errorMessage,
                            helperText: errorMessage ? String(errorMessage) : '',
                        }
                    }}
                />
            </LocalizationProvider>
            {errorMessage && <p className="text-red-500 text-sm">{String(errorMessage)}</p>}
        </div>
    );
};

export default DatePickerCom;
