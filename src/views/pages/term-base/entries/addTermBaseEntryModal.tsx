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
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { TermBaseEntriesTypes } from '@/types/termBaseEntriesTypes'
import { useTermBaseHooks } from '@/services/useTermBaseHooks'
import { createTermBaseEntrySchema, TermBaseEntrySchema } from '@/utils/schemas/termBaseEntrySchema'
import { fetchTermBase } from '@/services/utility/termBaseEntry'

interface AddTermBaseEntryModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'create' | 'edit', entry?: TermBaseEntriesTypes) => void
  title: string
  entryData?: TermBaseEntriesTypes | null
  mode: 'create' | 'edit'
  termBaseId?: number | undefined
}

const AddTermBaseEntryModal: React.FC<AddTermBaseEntryModalProps> = ({
  open,
  handleClose,
  title,
  entryData,
  mode,
  termBaseId
}) => {
  const { t } = useTranslation('global')
  const [selectedTermBase, setSelectedTermBase] = React.useState<TermBaseEntriesTypes[]>([])

  // Api Call
  const { useCreateTermBaseEntry, useEditTermBaseEntry, getTermBase } = useTermBaseHooks()
  const { mutate: createEntry } = useCreateTermBaseEntry()
  const { mutate: editEntry } = useEditTermBaseEntry()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TermBaseEntrySchema>({
    resolver: zodResolver(createTermBaseEntrySchema),
    mode: 'onSubmit',
    defaultValues: {
      term_base: termBaseId ?? undefined,
      original_term: '',
      translation: ''
    }
  })

  React.useEffect(() => {
    if (termBaseId) {
      setValue('term_base', termBaseId)
    }

    if (mode === 'edit' && entryData) {
      setValue('original_term', entryData.original_term)
      setValue('translation', entryData.translation)
      setValue('term_base', entryData?.term_base ?? 0)
    }
  }, [entryData, mode, setValue])

  React.useEffect(() => {
    const loadTermBases = async () => {
      if (mode === 'edit' && entryData?.term_base) {
        const termBase = await fetchTermBase(Number(entryData?.term_base))
        setSelectedTermBase(termBase ? [termBase] : [])
      } else {
        setSelectedTermBase([])
      }
    }
    loadTermBases()
  }, [mode, entryData?.term_base])

  const onSubmit: SubmitHandler<TermBaseEntrySchema> = data => {
    if (mode === 'create') {
      createEntry(data, {
        onSuccess: () => {
          toast.success(t('termBaseEntries.toasts.entryCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && entryData?.id) {
      editEntry(
        { id: entryData.id, ...data },
        {
          onSuccess: () => {
            toast.success(t('termBaseEntries.toasts.entryUpdatedSuccess'))
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
              {/* Term Base */}
              {!termBaseId && (
                <div className='col-span-6'>
                  <SearchableMultiSelect<TermBaseEntrySchema>
                    options={getTermBase}
                    name='term_base'
                    returnAsArray={false}
                    returnAsString={false}
                    register={register}
                    setValue={setValue}
                    fieldError={errors.term_base}
                    labelKey='name'
                    value={watch('term_base') || undefined}
                    className='w-full'
                    label={t('termBaseEntries.form.termBase')}
                    multiple={false}
                    showAsterisk={true}
                    selectedOptionsList={mode === 'edit' ? selectedTermBase : undefined}
                  />
                </div>
              )}

              {/* Original Term */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('termBaseEntries.form.originalTerm')}
                  type='text'
                  {...register('original_term')}
                  defaultValue={entryData?.original_term || null}
                  error={!!errors.original_term}
                  helperText={errors.original_term?.message}
                  showAsterisk={true}
                  autoFocus
                  id='original_term'
                  multiline
                  minRows={3}
                  maxRows={4}
                  sx={{ '& .MuiOutlinedInput-root': { height: 'auto' } }}
                />
              </div>

              {/* Translation */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('termBaseEntries.form.translation')}
                  type='text'
                  {...register('translation')}
                  defaultValue={entryData?.translation || null}
                  error={!!errors.translation}
                  helperText={errors.translation?.message}
                  showAsterisk={true}
                  autoFocus
                  id='translation'
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
                {mode === 'create' ? t('termBaseEntries.form.add') : t('termBaseEntries.form.update')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddTermBaseEntryModal
