import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { ServiceTypes } from '@/types/services'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@/@core/components/mui/TextField'
import { toast } from 'react-toastify'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { z } from 'zod'
import { useServicesHooks } from '@/services/useServicesHooks'

interface FaqFormData {
  question: string
  answer: string
}

interface AddFaqsModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  faqData?: { question: string; answer: string } | null | undefined
  mode: string | null
  serviceId: string
  serviceData?: ServiceTypes
}

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
})

const AddFaqsModal: React.FC<AddFaqsModalProps> = ({ open, handleClose, faqData, mode, serviceId, serviceData }) => {
  const { t } = useTranslation('global')
  const { mutate: editService } = useServicesHooks().useEditService()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    mode: 'onSubmit',
    defaultValues: {
      question: '',
      answer: ''
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && faqData) {
      setValue('question', faqData.question)
      setValue('answer', faqData.answer)
    } else if (mode === 'create') {
      reset()
    }
  }, [faqData, mode, setValue, reset])

  const onSubmit: SubmitHandler<FaqFormData> = data => {
    const formData = new FormData()

    // Get existing FAQs from serviceData
    let existingFaqs: Record<string, string> = {}
    if (serviceData?.faq) {
      try {
        existingFaqs = typeof serviceData.faq === 'object' ? serviceData.faq : JSON.parse(serviceData.faq)
      } catch (e) {
        existingFaqs = {}
      }
    }
    let updatedFaqs: Record<string, string> = { ...existingFaqs }
    if (mode === 'edit' && faqData) {
      if (faqData.question !== data.question) {
        // @ts-ignore
        delete updatedFaqs[faqData.question]
      }
    }

    updatedFaqs[data.question] = data.answer

    formData.append('faq', JSON.stringify(updatedFaqs))

    editService(
      {
        id: Number(serviceId),
        data: formData
      },
      {
        onSuccess: () => {
          toast.success(
            mode === 'edit' ? t('services.faqs.toasts.faqUpdatedSuccess') : t('services.faqs.toasts.faqAddedSuccess')
          )
          handleClose(false)
          reset()
        }
      }
    )
  }

  const handleCloseModal = () => {
    if (mode === 'create') {
      reset()
    }
    handleClose(false)
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
            <Typography variant='h4'>
              {mode === 'create' ? t('services.faqs.addFaq') : t('services.faqs.editFaq')}
            </Typography>
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
              {/* Question */}
              <div>
                <CustomTextField
                  fullWidth
                  label={t('services.faqs.question')}
                  type='text'
                  {...register('question')}
                  defaultValue={faqData?.question || ''}
                  error={!!errors.question}
                  helperText={errors.question?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Answer */}
              <div>
                <CustomTextField
                  fullWidth
                  label={t('services.faqs.answer')}
                  multiline
                  rows={4}
                  {...register('answer')}
                  defaultValue={faqData?.answer || ''}
                  error={!!errors.answer}
                  helperText={errors.answer?.message}
                  showAsterisk={true}
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
                type='submit'
              >
                {mode === 'create' ? t('services.faqs.addFaq') : t('services.faqs.editFaq')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddFaqsModal
