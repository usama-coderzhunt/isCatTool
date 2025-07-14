import * as React from 'react'
import { useTranslation } from 'next-i18next'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { useTranslationMemoryHooks } from '@/services/useTranslationMemoryHooks'
import { TranslationMemoryEntriesTypes } from '@/types/traslationMemoryEnntriesTypes'
import {
  createTranslationMemoryEntrySchema,
  TranslationMemoryEntrySchema
} from '@/utils/schemas/translationMemoryEntrySchema'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { fetchTranslationMemory } from '@/services/utility/translationMemoryEtries'

interface AddEntryModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'create' | 'edit', entry?: TranslationMemoryEntriesTypes) => void
  title: string
  entryData?: TranslationMemoryEntriesTypes | null
  mode: 'create' | 'edit'
  translationMemoryId?: number | undefined
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({
  open,
  handleClose,
  title,
  entryData,
  mode,
  translationMemoryId
}) => {
  const { t } = useTranslation('global')
  const [selectedTranslationMemory, setSelectedTranslationMemory] = React.useState<any[]>([])

  // Api Call
  const { useCreateTranslationMemoryEntry, useEditTranslationMemoryEntry, getTranslationMemory } =
    useTranslationMemoryHooks()
  const { mutate: createEntry } = useCreateTranslationMemoryEntry()
  const { mutate: editEntry } = useEditTranslationMemoryEntry()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TranslationMemoryEntrySchema>({
    resolver: zodResolver(createTranslationMemoryEntrySchema),
    mode: 'onSubmit',
    defaultValues: {
      translation_memory: translationMemoryId ?? undefined,
      reference: null,
      source_text: '',
      target_text: ''
    }
  })

  React.useEffect(() => {
    if (translationMemoryId) {
      setValue('translation_memory', translationMemoryId)
    }

    if (mode === 'edit' && entryData) {
      setValue('source_text', entryData.source_text)
      setValue('target_text', entryData.target_text)
      setValue('reference', entryData.reference)
      setValue('translation_memory', entryData?.translation_memory ?? 0)
    }
  }, [entryData, mode, setValue])

  React.useEffect(() => {
    const loadTranslationMemories = async () => {
      if (mode === 'edit' && entryData?.translation_memory) {
        const assignee = await fetchTranslationMemory(Number(entryData?.translation_memory))
        setSelectedTranslationMemory(assignee ? [assignee] : [])
      } else {
        setSelectedTranslationMemory([])
      }
    }
    loadTranslationMemories()
  }, [mode, entryData?.translation_memory])

  const onSubmit: SubmitHandler<TranslationMemoryEntrySchema> = data => {
    if (mode === 'create') {
      createEntry(data, {
        onSuccess: () => {
          toast.success(t('translationMemoryEntries.toasts.entryCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && entryData?.id) {
      editEntry(
        { id: entryData.id, ...data },
        {
          onSuccess: () => {
            toast.success(t('translationMemoryEntries.toasts.entryUpdatedSuccess'))
            handleCloseModal()
          }
        }
      )
    }
  }

  const handleCloseModal = () => {
    handleClose()
    reset()
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
        <Box sx={modalStyles}>
          <div className='flex gap-x-2 justify-between items-center mb-6'>
            <Typography variant='h4'>{title}</Typography>
            <Button
              onClick={handleCloseModal}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <div className='w-full grid grid-cols-12 gap-6'>
              {/* Reference */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('translationMemoryEntries.form.reference')}
                  type='text'
                  {...register('reference')}
                  defaultValue={entryData?.reference || null}
                  error={!!errors.reference}
                  helperText={errors.reference?.message}
                  showAsterisk={false}
                />
              </div>

              {/* Translation Memory */}
              {!translationMemoryId && (
                <div className='col-span-6'>
                  <SearchableMultiSelect<TranslationMemoryEntrySchema>
                    options={getTranslationMemory}
                    name='translation_memory'
                    returnAsArray={false}
                    returnAsString={false}
                    register={register}
                    setValue={setValue}
                    fieldError={errors.translation_memory}
                    labelKey='name'
                    value={watch('translation_memory') || undefined}
                    className='w-full'
                    label={t('translationMemoryEntries.form.translationMemory')}
                    multiple={false}
                    showAsterisk={true}
                    selectedOptionsList={mode === 'edit' ? selectedTranslationMemory : undefined}
                  />
                </div>
              )}

              {/* Source Text */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('translationMemoryEntries.form.sourceText')}
                  type='text'
                  {...register('source_text')}
                  defaultValue={entryData?.source_text || null}
                  error={!!errors.source_text}
                  helperText={errors.source_text?.message}
                  showAsterisk={true}
                  autoFocus
                  disabled={mode === 'edit' && entryData?.segment_id_reference ? true : false}
                  id='source_text'
                  multiline
                  minRows={3}
                  maxRows={4}
                  sx={{ '& .MuiOutlinedInput-root': { height: 'auto' } }}
                />
              </div>

              {/* Target Text */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('translationMemoryEntries.form.targetText')}
                  type='text'
                  {...register('target_text')}
                  defaultValue={entryData?.target_text || null}
                  error={!!errors.target_text}
                  helperText={errors.target_text?.message}
                  showAsterisk={true}
                  autoFocus
                  id='target_text'
                  multiline
                  minRows={3}
                  maxRows={4}
                  sx={{ '& .MuiOutlinedInput-root': { height: 'auto' } }}
                />
              </div>
            </div>

            <div className='w-full flex justify-end'>
              <Button
                variant='contained'
                type='submit'
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
              >
                {mode === 'create'
                  ? t('translationMemoryEntries.form.addBtnText')
                  : t('translationMemoryEntries.form.updateBtnText')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddEntryModal
