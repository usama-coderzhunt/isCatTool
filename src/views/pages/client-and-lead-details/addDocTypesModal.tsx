import * as React from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import CustomTextField from '@/@core/components/mui/TextField'
import type { CreateDocumentTypeInput, DocumentType } from '@/types/documentTypes'
import { useDocsHooks } from '@/services/useDocsHooks'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import Recaptcha from '@/components/Recaptcha'
import { useTranslation } from 'react-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'


interface AddDocTypesModalProps {
    open: boolean
    handleClose: () => void
    title: string
    mode: 'create' | 'edit'
    docTypeData?: DocumentType | null
}

const AddDocTypesModal = ({ open, handleClose, title, mode, docTypeData }: AddDocTypesModalProps) => {
    // store
    // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore();

    // Api Call
    const { useCreateDocumentType, useUpdateDocumentType } = useDocsHooks()
    const { mutate: createDocumentType } = useCreateDocumentType()
    const { mutate: updateDocumentType } = useUpdateDocumentType(docTypeData?.id ?? null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue
    } = useForm<CreateDocumentTypeInput>({
        mode: 'onSubmit'
    })

    const { t } = useTranslation('global')

    React.useEffect(() => {
        if (mode === 'edit' && docTypeData) {
            setValue('name', docTypeData.name)
        } else if (mode === 'create') {
            reset()
        }
    }, [docTypeData, mode, setValue, reset])

    const onSubmit: SubmitHandler<CreateDocumentTypeInput> = async (data: CreateDocumentTypeInput) => {
        if (mode === 'edit' && docTypeData) {
            updateDocumentType(data.name, {
                onSuccess: () => {
                    handleCloseModal()
                }
            })
        } else {
            createDocumentType(data.name, {
                onSuccess: () => {
                    handleCloseModal()
                }
            })
        }
    }

    const handleCloseModal = () => {
        handleClose();
        reset();
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
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            slotProps={{
                backdrop: {
                    timeout: 500
                }
            }}
        >
            <Fade in={open}>
                <Box sx={{ ...modalStyles, width: 450 }}>
                    <div className='flex gap-x-2 justify-between items-center mb-6'>
                        <Typography variant='h4'>{mode === 'create' ? t('documents.types.create') : t('documents.types.edit')}</Typography>
                        <Button
                            onClick={handleCloseModal}
                            variant='outlined'
                            className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
                        >
                            <i className='tabler-x w-[18px] h-[18px]'></i>
                        </Button>
                    </div>
                    <Box>
                        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                            <CustomTextField
                                autoFocus
                                fullWidth
                                id='name'
                                label={t('documents.types.name')}
                                type='text'
                                {...register('name', { required: 'Document Type Name is required' })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                showAsterisk={true}
                                sx={{
                                    '& .MuiInputLabel-root': {
                                        backgroundColor: 'background.paper',
                                        px: 1
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value.trim()) {
                                        setValue('name', '', { shouldValidate: true });
                                    }
                                }}
                            />

                            {/* Recaptcha */}
                            {/* <Recaptcha /> */}

                            <div className='w-full flex justify-end'>
                                <Button
                                    variant='contained'
                                    sx={{
                                        width: 'max-content',
                                        padding: '0.5rem 1rem'
                                    }}
                                    type='submit'
                                // disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
                                >
                                    {mode === 'create' ? t('documents.types.create') : t('documents.types.edit')}
                                </Button>
                            </div>
                        </form>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    )
}

export default AddDocTypesModal
