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
import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@/@core/components/mui/TextField'
import type { CreateDocumentInput } from '@/types/documentTypes'
import { createDocumentSchema } from '@/utils/schemas/createDocumentSchema'
import { useDocsHooks } from '@/services/useDocsHooks'
import FileUploaderSingle from '@/components/fileUploader'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useLawyerClientsHooks } from '@/services/lawyerClients'
import { useCasesHooks } from '@/services/useCases'
import { useClientHooks } from '@/services/useClientHook'
import { usePathname } from 'next/navigation'
import { LawyerClientTypes } from '@/types/lawyerClients'


interface AddDocsModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: () => void
  title: string
  selectedClientData?: LawyerClientTypes
  mode?: 'create' | 'edit'
  docId?: number
  selectedDocumentData?: CreateDocumentInput
}

const AddDocsModal = ({ open, handleClose, title, selectedClientData, mode, docId, selectedDocumentData }: AddDocsModalProps) => {
  // store
  // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore();
  const pathname = usePathname()

  // Api Call
  const { useCreateDocument, useUpdateDocument, getDocsType } = useDocsHooks()
  const { mutate: createDocument } = useCreateDocument()
  const { mutate: updateDocument } = useUpdateDocument()
  const { getLawyerClients } = useLawyerClientsHooks()
  const { useFetchClientTransactions } = useClientHooks()
  const { getCases } = useCasesHooks()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateDocumentInput>({
    // resolver: zodResolver(createDocumentSchema),
    mode: 'onSubmit'
  })

  const file = watch('file')
  const isLawyerClientPath = pathname?.startsWith('/en/dashboards/lawyer-client/')

  React.useEffect(() => {
    if (mode === 'edit' && selectedDocumentData) {
      setValue('document_type', selectedDocumentData.document_type)
      setValue('note', selectedDocumentData.note)
      setValue('name', selectedDocumentData.name)
      setValue('client_list', selectedDocumentData.client_list)
      setValue('case_list', selectedDocumentData.case_list)
    } else if (mode === 'create') {
      reset({
        name: '',
        document_type: '',
        note: '',
        client_list: [],
        case_list: [],
        file: []
      })
    }
  }, [mode, selectedDocumentData, setValue, reset])

  const onSubmit: SubmitHandler<CreateDocumentInput> = async (data: CreateDocumentInput) => {
    const updatedClientList = selectedClientData?.id ? [...new Set([selectedClientData?.id, ...(data.client_list || [])])] : data.client_list || [];
    const formattedClientList = updatedClientList.join(',');

    const payload: any = {};

    // Only include fields that have changed from the original data
    if (data.name !== selectedDocumentData?.name) {
      payload.name = data.name;
    }
    if (data.document_type !== selectedDocumentData?.document_type) {
      payload.document_type = data.document_type;
    }
    if (data.note !== selectedDocumentData?.note) {
      payload.note = data.note ?? "";
    }
    if (JSON.stringify(updatedClientList) !== JSON.stringify(selectedDocumentData?.client_list)) {
      payload.client_list = formattedClientList;
    }
    if (JSON.stringify(data.case_list) !== JSON.stringify(selectedDocumentData?.case_list)) {
      payload.case_list = data.case_list || [];
    }

    // Only include file if a new one is selected and it's actually a File object
    if (data.file?.[0] && data.file[0] instanceof File) {
      payload.file = data.file[0];
    }

    if (mode === 'edit' && docId) {
      updateDocument({ id: docId, ...payload }, {
        onSuccess: () => {
          handleCloseModal();
        }
      })
    } else {
      // For create mode, send all fields
      createDocument({
        name: data.name,
        document_type: data.document_type,
        note: data.note ?? "",
        client_list: formattedClientList,
        case_list: data.case_list || [],
        file: data.file?.[0]
      }, {
        onSuccess: () => {
          handleCloseModal();
        }
      })
    }
  }

  const handleCloseModal = () => {
    handleClose();
    if (mode === 'create') {
      reset();
    }
  }

  const { t } = useTranslation('global')

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={handleCloseModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      sx={{
        overflow: 'auto !important',
        scrollbarWidth: 'none !important',
        '&::-webkit-scrollbar': {
          display: 'none !important'
        }
      }} slotProps={{
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
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <Box
            sx={{
              overflowY: 'auto',
              flexGrow: 1,
              maxHeight: 'calc(100vh - 20px)',
              scrollbarWidth: 'none !important',
              '&::-webkit-scrollbar': {
                display: 'none !important'
              }
            }}
          >
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <FileUploaderSingle
                files={file || []}
                setFiles={(selectedFiles) => setValue("file", selectedFiles)}
                register={register("file")}
                resetFiles={() => reset()}
                errorMessage={errors.file?.message}
                existingFile={mode === 'edit' ? selectedDocumentData?.file : undefined}
                documentName={mode === 'edit' ? selectedDocumentData?.name : undefined}
                isEditMode={mode === 'edit'}
              />
              <CustomTextField
                fullWidth
                label={t('cases.form.name')}
                type='text'
                {...register('name')}
                defaultValue={selectedDocumentData?.name || null}
                error={!!errors.name}
                helperText={errors.name?.message}
                showAsterisk={true}
              />
              <SearchableMultiSelect<CreateDocumentInput>
                options={getDocsType}
                name="document_type"
                register={register}
                returnAsArray={false}
                returnAsString={true}
                setValue={setValue}
                fieldError={errors.document_type}
                labelKey="name"
                value={watch('document_type') || undefined}
                className="w-full"
                label={t('cases.form.types')}
                multiple={false}
                showAsterisk={true}
              />
              <SearchableMultiSelect<CreateDocumentInput>
                options={isLawyerClientPath ? getLawyerClients : useFetchClientTransactions}
                name="client_list"
                returnAsArray={true}
                returnAsString={false}
                register={register}
                setValue={setValue}
                fieldError={errors.client_list}
                labelKey="first_name"
                value={
                  (watch('client_list')?.length ?? 0) > 0
                    ? watch('client_list')
                    : selectedClientData?.id
                      ? [selectedClientData?.id]
                      : []
                }
                className="w-full"
                label="Clients"
                multiple={true}
                defaultOption={selectedClientData ? { id: selectedClientData?.id, first_name: selectedClientData?.first_name } : undefined}
              />
              {pathname?.startsWith('/en/dashboards/lawyer-client/') && (
                <SearchableMultiSelect<CreateDocumentInput>
                  options={getCases}
                  name="case_list"
                  returnAsArray={true}
                  returnAsString={false}
                  register={register}
                  setValue={setValue}
                  fieldError={errors.case_list}
                  labelKey="title"
                  value={watch('case_list') || []}
                  className="w-full"
                  label="Cases"
                  multiple={true}
                />
              )}
              <CustomTextField
                autoFocus
                fullWidth
                id='note'
                label={t('cases.form.note')}
                type='text'
                multiline
                minRows={3}
                maxRows={4}
                {...register('note')}
                error={!!errors.note}
                helperText={errors.note?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "auto",
                  },
                }}
                onBlur={(e) => {
                  if (!e.target.value.trim()) {
                    setValue('note', null, { shouldValidate: true });
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
                  {mode === 'edit' ? t('cases.form.updateDocument') : t('cases.form.createDocument')}
                </Button>
              </div>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddDocsModal
