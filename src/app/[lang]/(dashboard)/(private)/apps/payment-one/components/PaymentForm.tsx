"use client"
import React from 'react'
import { Card, CardContent, Typography, Grid, Box, Button, TextField, FormControl, FormLabel, MenuItem, Radio, RadioGroup, FormControlLabel } from '@mui/material'
import { ServicePlanTypes } from '@/types/servicesPlans'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'

interface FormData {
    fullName: string
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    paymentMethod: string
}

interface PaymentFormProps {
    planData: {
        plan: ServicePlanTypes
        serviceName: string
    }
    onSubmit: (data: FormData) => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({ planData, onSubmit }) => {
    const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            fullName: '',
            cardNumber: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            paymentMethod: 'paypal'
        }
    })

    const paymentMethod = watch('paymentMethod')

    // Generate months array
    const months = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1
        return month.toString().padStart(2, '0')
    })

    // Generate years array (current year to current year + 10)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString())

    return (
        <Card className="">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} className="mb-8">
                            <FormControl component="fieldset" className="w-full">
                                <FormLabel component="legend" className="mb-4">Select Payment Method</FormLabel>
                                <Controller
                                    name="paymentMethod"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            {...field}
                                            className="flex flex-row gap-8"
                                        >
                                            <FormControlLabel
                                                value="paypal"
                                                control={<Radio />}
                                                label={
                                                    <Box className="flex items-center gap-2">
                                                        <img
                                                            className="h-8 w-auto dark:hidden"
                                                            src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal.svg"
                                                            alt="PayPal"
                                                        />
                                                        <img
                                                            className="hidden h-8 w-auto dark:flex"
                                                            src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal-dark.svg"
                                                            alt="PayPal"
                                                        />
                                                    </Box>
                                                }
                                            />
                                            <FormControlLabel
                                                value="stripe"
                                                control={<Radio />}
                                                label={
                                                    <Box className="flex items-center gap-2">
                                                        <img
                                                            className="h-8 w-auto dark:hidden"
                                                            src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/stripe.svg"
                                                            alt="Stripe"
                                                        />
                                                        <img
                                                            className="hidden h-8 w-auto dark:flex"
                                                            src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/stripe-dark.svg"
                                                            alt="Stripe"
                                                        />
                                                    </Box>
                                                }
                                            />
                                            <FormControlLabel
                                                value="manual"
                                                control={<Radio />}
                                                label={
                                                    <Box className="flex items-center gap-2">
                                                        <i className="tabler-cash text-2xl text-green-600" />
                                                        <Typography variant="h5" className='text-base text-secondary font-extrabold'>Manual Payment</Typography>
                                                    </Box>
                                                }
                                            />
                                        </RadioGroup>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        {paymentMethod !== 'manual' ? (
                            <>
                                <Grid item xs={12}>
                                    <Controller
                                        name="fullName"
                                        control={control}
                                        rules={{ required: 'Card holder name is required' }}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                fullWidth
                                                type="text"
                                                label="Full name (as displayed on card)"
                                                error={!!errors.fullName}
                                                helperText={errors.fullName?.message}
                                                showAsterisk={true}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    '& .MuiFormLabel-asterisk': {
                                                        color: 'red'
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Controller
                                        name="cardNumber"
                                        control={control}
                                        rules={{
                                            required: 'Card number is required',
                                            validate: {
                                                length: (value) => value.length === 16 || 'Card number must be 16 digits'
                                            }
                                        }}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                fullWidth
                                                type="number"
                                                label="Card number"
                                                error={!!errors.cardNumber}
                                                helperText={errors.cardNumber?.message}
                                                showAsterisk={true}
                                                placeholder="xxxx xxxx xxxx xxxx"
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    '& .MuiFormLabel-asterisk': {
                                                        color: 'red'
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <Controller
                                        name="expiryMonth"
                                        control={control}
                                        rules={{ required: 'Expiry month is required' }}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Expiry Month"
                                                error={!!errors.expiryMonth}
                                                helperText={errors.expiryMonth?.message}
                                                showAsterisk={true}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    '& .MuiFormLabel-asterisk': {
                                                        color: 'red'
                                                    }
                                                }}
                                            >
                                                {months.map((month) => (
                                                    <MenuItem key={month} value={month}>
                                                        {month}
                                                    </MenuItem>
                                                ))}
                                            </CustomTextField>
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <Controller
                                        name="expiryYear"
                                        control={control}
                                        rules={{ required: 'Expiry year is required' }}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Expiry Year"
                                                showAsterisk={true}
                                                error={!!errors.expiryYear}
                                                helperText={errors.expiryYear?.message}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    '& .MuiFormLabel-asterisk': {
                                                        color: 'red'
                                                    }
                                                }}
                                            >
                                                {years.map((year) => (
                                                    <MenuItem key={year} value={year}>
                                                        {year}
                                                    </MenuItem>
                                                ))}
                                            </CustomTextField>
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <Controller
                                        name="cvv"
                                        control={control}
                                        rules={{ required: 'CVV is required' }}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                fullWidth
                                                type="number"
                                                label="CVV"
                                                showAsterisk={true}
                                                error={!!errors.cvv}
                                                helperText={errors.cvv?.message}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    '& .MuiFormLabel-asterisk': {
                                                        color: 'red'
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </>
                        ) : (
                            <Grid item xs={12}>
                                <Card variant="outlined" className="p-4">
                                    <Typography variant="h6" className="mb-4">
                                        Bank Account Details
                                    </Typography>
                                    <Box className="space-y-3">
                                        <Box className="flex items-center justify-between">
                                            <Typography color="text.secondary">Account Title</Typography>
                                            <Typography>Your Company Name</Typography>
                                        </Box>
                                        <Box className="flex items-center justify-between">
                                            <Typography color="text.secondary">Bank Name</Typography>
                                            <Typography>Example Bank</Typography>
                                        </Box>
                                        <Box className="flex items-center justify-between">
                                            <Typography color="text.secondary">Account Number</Typography>
                                            <Typography>1234567890</Typography>
                                        </Box>
                                        <Box className="flex items-center justify-between">
                                            <Typography color="text.secondary">IBAN</Typography>
                                            <Typography>PK12ABCD1234567890</Typography>
                                        </Box>
                                        <Box className="flex items-center justify-between">
                                            <Typography color="text.secondary">Swift Code</Typography>
                                            <Typography>EXBK0001234</Typography>
                                        </Box>
                                    </Box>
                                    <Box className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                        <Typography variant="body2" color="warning.main">
                                            Please keep the payment receipt for future reference. Your order will be processed once the payment is confirmed.
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        )}
                    </Grid>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className="mt-6 w-full"
                    >
                        Pay now
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default PaymentForm 
