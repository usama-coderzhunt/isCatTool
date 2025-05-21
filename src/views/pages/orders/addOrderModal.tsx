import * as React from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { OrdersTypes } from '@/types/ordersTypes'
import { useOrdersHooks } from '@/services/useOrdersHooks'
import { MenuItem } from '@mui/material'
import { FormHelperText } from '@mui/material'
import { Select } from '@mui/material'
import { InputLabel } from '@mui/material'
import { FormControl } from '@mui/material'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { useServicesHooks } from '@/services/useServicesHooks'

interface AddOrderModalProps {
    open: boolean
    handleClose: React.Dispatch<React.SetStateAction<boolean>>
    title: string
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ open, handleClose, title }) => {
    const { t } = useTranslation('global')
    const userId = localStorage.getItem('userID')
    const { getServicePlans, getServicePlanById } = useServicesHooks()

    // hooks
    const { useCreateOrderOneTimePayment } = useOrdersHooks()
    const { mutate: createOrder } = useCreateOrderOneTimePayment()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        watch,
        formState: { errors }
    } = useForm<OrdersTypes>({
        defaultValues: {
            user: userId ? Number(userId) : undefined,
            service_plan: undefined,
            coupon_code: '',
            currency_code: 'USD',
            is_subscription: undefined,
            billing_cycle: null
        },
        mode: 'onSubmit'
    })

    // Watch service_plan changes
    const selectedPlan = watch('service_plan')
    const billingCycle = watch('billing_cycle')

    const { data: servicePlanData } = getServicePlanById(selectedPlan)
    const serviceType = servicePlanData?.data?.service_type
    const regularPrice = servicePlanData?.data?.price
    const yearlyPrice = servicePlanData?.data?.yearly_price

    const finalPrice = React.useMemo(() => {
        if (serviceType === 'one_time') {
            return regularPrice
        }

        if (billingCycle === 'yearly') {
            return yearlyPrice
        }

        return regularPrice
    }, [billingCycle, serviceType, regularPrice, yearlyPrice])

    React.useEffect(() => {
        if (finalPrice) {
            setValue('amount', finalPrice)
        }
    }, [finalPrice, setValue])

    const onSubmit: SubmitHandler<OrdersTypes> = (data: OrdersTypes) => {
        const payload: Partial<OrdersTypes> = {
            amount: finalPrice,
            user: userId ? Number(userId) : undefined,
            service_plan: data.service_plan,
            currency_code: "USD"
        }

        if (data.coupon_code && data.coupon_code.trim() !== '') {
            payload.coupon_code = data.coupon_code
        }

        if (data.billing_cycle) {
            payload.billing_cycle = data.billing_cycle
            payload.is_subscription = true
        }

        createOrder(payload as OrdersTypes, {
            onSuccess: () => {
                toast.success(`Order created successfully`)
                handleCloseModal()
            }
        })
    }

    const handleCloseModal = () => {
        reset()
        handleClose(false);
    }

    return (
        <Modal
            aria-labelledby='transition-modal-title'
            aria-describedby='transition-modal-description'
            open={open}
            onClose={handleCloseModal}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500
                }
            }}
        >
            <Fade in={open}>
                <Box sx={{ ...modalStyles, width: 450 }}>
                    <div className='flex gap-x-2 justify-between items-center mb-6'>
                        <Typography variant='h4'>{title}</Typography>
                        <Button
                            onClick={handleCloseModal}
                            variant='outlined'
                            className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
                        >
                            <i className='tabler-x w-[18px] h-[18px]'></i>
                        </Button>
                    </div>
                    <form noValidate autoComplete='off' className='flex flex-col gap-6' onSubmit={handleSubmit(onSubmit)}>
                        <div className='w-full flex flex-col gap-6'>
                            {/* Service Plan */}
                            <div className='w-full'>
                                <Controller
                                    control={control}
                                    name="service_plan"
                                    rules={{
                                        required: 'Service Plan is required'
                                    }}
                                    render={({ field }) => (
                                        <SearchableMultiSelect<OrdersTypes>
                                            options={getServicePlans}
                                            name="service_plan"
                                            register={register}
                                            returnAsArray={false}
                                            returnAsString={false}
                                            setValue={setValue}
                                            fieldError={errors.service_plan}
                                            labelKey="name"
                                            value={watch('service_plan') || undefined}
                                            className="w-full"
                                            label="Service Plan"
                                            multiple={false}
                                            showAsterisk={true}
                                        />
                                    )}
                                />
                            </div>

                            {/* Coupon Code */}
                            <div className='w-full'>
                                <CustomTextField
                                    fullWidth
                                    label="Coupon Code"
                                    type='text'
                                    {...register('coupon_code')}
                                    error={!!errors.coupon_code}
                                    helperText={errors.coupon_code?.message}
                                    onBlur={(e) => {
                                        if (!e.target.value.trim()) {
                                            setValue('coupon_code', null, { shouldValidate: true });
                                        }
                                    }}
                                />
                            </div>

                            {/* Billing Cycle */}
                            <div className='w-full'>
                                <Controller
                                    name='billing_cycle'
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl error={!!errors.billing_cycle} fullWidth>
                                            <InputLabel
                                                shrink
                                            >
                                                Billing Cycle
                                            </InputLabel>
                                            <Select
                                                {...field}
                                                label='Billing Cycle'
                                                notched
                                            >
                                                <MenuItem value={''} disabled>Select Billing Cycle</MenuItem>
                                                <MenuItem value='monthly'>Monthly</MenuItem>
                                                <MenuItem value='yearly'>Yearly</MenuItem>
                                            </Select>
                                            {errors.billing_cycle && <FormHelperText>{errors.billing_cycle.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </div>

                        </div>
                        {/* Submit Button */}
                        <div className='w-full flex justify-end'>
                            <Button
                                variant='contained'
                                sx={{
                                    width: 'max-content',
                                    padding: '0.5rem 1rem'
                                }}
                                type="submit"
                            >
                                Create Order
                            </Button>
                        </div>
                    </form>
                </Box>
            </Fade>
        </Modal>
    )
}

export default AddOrderModal
