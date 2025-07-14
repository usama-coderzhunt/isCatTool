'use client'

import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { Backdrop, Box, Modal, Fade, Button, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import { modalStyles } from '@/utils/constants/modalsStyles'
import KeyValuePairInput from '@/components/common/KeyValuePairInput'
import { toast } from 'react-toastify'
import { useLlmOperatorsHooks } from '@/services/useLlmOperatorsHooks'
import { LLMOperatorTypes } from '@/types/llmOperatorTypes'

type ValueType = 'string' | 'number' | 'boolean'

interface KeyValuePair {
  key: string
  value: string | number | boolean
  type: ValueType
}

interface AddLlmOperatorModalProps {
  open: boolean
  handleClose: () => void
  llmOperatorData?: any
  llmOperatorID?: number | null
  mode: 'view' | 'create' | 'edit'
  title: string
}

const AddLlmOperatorModal = ({
  open,
  handleClose,
  llmOperatorData,
  llmOperatorID,
  mode,
  title
}: AddLlmOperatorModalProps) => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  React.useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const { useCreateLlmOperator, useEditLlmOperator } = useLlmOperatorsHooks()
  const { mutate: createLlmOperator, isLoading: isCreating } = useCreateLlmOperator()
  const { mutate: editLlmOperator, isLoading: isEditing } = useEditLlmOperator()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LLMOperatorTypes>({
    defaultValues: {
      name: '',
      description: '',
      metadata: {}
    }
  })

  const handleMetadataChange = (pairs: KeyValuePair[], onChange: (value: any) => void) => {
    const newMetadata = pairs.reduce(
      (acc, { key, value }) => {
        acc[key] = String(value)
        return acc
      },
      {} as Record<string, string>
    )
    onChange(newMetadata)
  }

  React.useEffect(() => {
    if (llmOperatorData && (mode === 'edit' || mode === 'view')) {
      reset({
        name: llmOperatorData.name,
        description: llmOperatorData.description || '',
        metadata: llmOperatorData.metadata || {}
      })
    }
  }, [llmOperatorData, mode, reset])

  const onSubmit = async (data: any) => {
    if (mode === 'create') {
      createLlmOperator(data, {
        onSuccess: () => {
          toast.success(t('llmOperators.toasts.llmOperatorCreatedSuccess'))
          handleClose()
          handleModalClose()
          reset()
        }
      })
    } else if (mode === 'edit' && llmOperatorID) {
      editLlmOperator(
        { id: llmOperatorID, ...data },
        {
          onSuccess: () => {
            toast.success(t('llmOperators.toasts.llmOperatorUpdatedSuccess'))
            handleClose()
            handleModalClose()
            reset()
          }
        }
      )
    }
  }

  const handleModalClose = () => {
    reset({
      name: '',
      description: '',
      metadata: {}
    })
    handleClose()
  }

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={handleModalClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500
        }
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyles}>
          <div className='flex gap-x-2 justify-between items-center mb-4 sticky top-[-16px] bg-backgroundPrimary z-50 pb-2 mx-[-16px] px-4'>
            <Typography variant='h4'>{title}</Typography>
            <Button
              onClick={handleModalClose}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]' />
            </Button>
          </div>
          <Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <div className='w-full grid grid-cols-12 gap-6'>
                {/* Name */}
                <div className='col-span-6'>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label={t('llmOperators.addLlmOperatorModal.name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        fullWidth
                        showAsterisk={true}
                        disabled={mode === 'view'}
                      />
                    )}
                  />
                </div>

                {/* Metadata */}
                <div className='col-span-12'>
                  <Controller
                    name='metadata'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <KeyValuePairInput
                        pairs={Object.entries(value).map(([key, value]) => ({
                          key,
                          value: value as string,
                          type: 'string'
                        }))}
                        onChange={newPairs => handleMetadataChange(newPairs as any, onChange)}
                        disabled={mode === 'view'}
                        showTypeSelector={false}
                        label={t('llmOperators.addLlmOperatorModal.metadata')}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <div className='col-span-12'>
                <Controller
                  name='description'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label={t('llmOperators.addLlmOperatorModal.description')}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      fullWidth
                      multiline
                      rows={4}
                      disabled={mode === 'view'}
                    />
                  )}
                />
              </div>

              {/* Submit Button */}
              {mode !== 'view' && (
                <div className='w-full flex justify-end'>
                  <Button
                    variant='contained'
                    sx={{
                      width: 'max-content',
                      padding: '0.5rem 1rem'
                    }}
                    type='submit'
                    disabled={isCreating || isEditing}
                  >
                    {mode === 'create' ? t('llmOperators.add') : t('llmOperators.update')}
                  </Button>
                </div>
              )}
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddLlmOperatorModal
