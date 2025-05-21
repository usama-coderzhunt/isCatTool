import * as React from 'react'
import { useTranslation } from 'next-i18next'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'

import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@/@core/components/mui/TextField'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore';
import { toast } from 'react-toastify'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { NotificationTemplateType, METHOD_CHOICES, TARGET_CHOICES } from '@/types/notificationTypes'
import { useNotificationHooks } from '@/services/useNotificationHooks'
import { notificationSchema } from '@/schemas/notificationsSchema'

interface AddNotificationModalProps {
    open: boolean
    handleClose: React.Dispatch<React.SetStateAction<boolean>>
    notificationData?: NotificationTemplateType | null
    mode: string | null
}

const AddNotificationModal: React.FC<AddNotificationModalProps> = ({ open, handleClose, notificationData, mode }) => {
    const { t } = useTranslation('global')
    // store
    // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore();

    // hooks
    const { useCreateNotification, useEditNotification } = useNotificationHooks()
    const { mutate: createNotification } = useCreateNotification()
    const { mutate: editNotification } = useEditNotification()


    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<NotificationTemplateType>({
        resolver: zodResolver(notificationSchema),
        mode: 'onSubmit',
        defaultValues: {
            name: '',
            method: '',
            to_who: '',
        }
    })

    React.useEffect(() => {
        if (mode === 'edit' && notificationData) {
            setValue('name', notificationData.name)
            setValue('method', notificationData.method)
            setValue('to_who', notificationData.to_who)
        } else if (mode === 'create') {
            reset()
        }
    }, [notificationData, mode, setValue, reset])


    const onSubmit: SubmitHandler<NotificationTemplateType> = (data: any) => {
        // if (!recaptchaToken && process.env.NEXT_PUBLIC_ENV !== "development") {
        //     return;
        // }
        if (mode === 'create') {
            createNotification(data as NotificationTemplateType, {
                onSuccess: () => {
                    toast.success(t('notifications.success.created'))
                    handleCloseModal()
                }
            })
        } else if (mode === 'edit' && notificationData?.id) {
            editNotification(
                { id: Number(notificationData?.id), ...data },
                {
                    onSuccess: () => {
                        toast.success(t('notifications.success.updated'))
                        handleCloseModal()
                    }
                }
            )
        }
    }

    const handleCloseModal = () => {
        if (mode === 'create') {
            reset()
        }
        handleClose(false);
        // setRecaptchaToken(null)
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
                        <Typography variant='h4'>{t(`notifications.modal.${mode}`)}</Typography>
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
                            {/* Name */}
                            <div>
                                <CustomTextField
                                    fullWidth
                                    label={t('notifications.modal.name')}
                                    type='text'
                                    {...register('name')}
                                    defaultValue={notificationData?.name || ''}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    showAsterisk={true}
                                />
                            </div>

                            {/* Method */}
                            <div>
                                <CustomTextField
                                    select
                                    fullWidth
                                    label={t('notifications.modal.method')}
                                    {...register('method')}
                                    value={watch('method') || ''}
                                    error={!!errors.method}
                                    helperText={errors.method?.message}
                                    showAsterisk={true}
                                    sx={{ '& .MuiSelect-select': { color: 'text.secondary' } }}
                                >
                                    <MenuItem value="" disabled sx={{ color: 'text.secondary' }}>{t('notifications.modal.selectMethod')}</MenuItem>
                                    <MenuItem value={METHOD_CHOICES.EMAIL}>{t('notifications.modal.methods.email')}</MenuItem>
                                    <MenuItem value={METHOD_CHOICES.SMS}>{t('notifications.modal.methods.sms')}</MenuItem>
                                    <MenuItem value={METHOD_CHOICES.BOTH}>{t('notifications.modal.methods.both')}</MenuItem>
                                </CustomTextField>
                            </div>

                            {/* To Who */}
                            <div>
                                <CustomTextField
                                    select
                                    fullWidth
                                    label={t('notifications.modal.toWho')}
                                    {...register('to_who')}
                                    value={watch('to_who') || ''}
                                    error={!!errors.to_who}
                                    helperText={errors.to_who?.message}
                                    showAsterisk={true}
                                    sx={{ '& .MuiSelect-select': { color: 'text.secondary' } }}
                                >
                                    <MenuItem value="" disabled sx={{ color: 'text.secondary' }}>{t('notifications.modal.selectTarget')}</MenuItem>
                                    <MenuItem value={TARGET_CHOICES.STAFF}>{t('notifications.modal.targets.staff')}</MenuItem>
                                    <MenuItem value={TARGET_CHOICES.CLIENT}>{t('notifications.modal.targets.client')}</MenuItem>
                                    <MenuItem value={TARGET_CHOICES.BOTH_TARGETS}>{t('notifications.modal.targets.both')}</MenuItem>
                                </CustomTextField>
                            </div>
                        </div>

                        {/* Recaptcha */}
                        {/* <Recaptcha /> */}

                        {/* Submit Button */}
                        {(mode === 'create' || mode === 'edit') && (
                            <div className='w-full flex justify-end'>
                                <Button
                                    variant='contained'
                                    sx={{
                                        width: 'max-content',
                                        padding: '0.5rem 1rem'
                                    }}
                                    type="submit"
                                // disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
                                >
                                    {t(`notifications.modal.${mode === 'create' ? 'createButton' : 'updateButton'}`)}
                                </Button>
                            </div>
                        )}
                    </form>
                </Box>
            </Fade>
        </Modal>
    )
}

export default AddNotificationModal
