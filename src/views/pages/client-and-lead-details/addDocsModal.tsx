import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { z } from 'zod'

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
import { useDocsHooks } from '@/services/useDocsHooks'
import FileUploaderSingle from '@/components/fileUploader'

// Goggle ReCaptcha
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useLawyerClientsHooks } from '@/services/lawyerClients'
import { useCasesHooks } from '@/services/useCases'
import { useClientHooks } from '@/services/useClientHook'
import { usePathname } from 'next/navigation'
import { LawyerClientTypes } from '@/types/lawyerClients'
import { toast } from 'react-toastify'
import { fetchCasesByIds, fetchDocumentType } from '@/services/utility/document'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import axiosInstance from '@/utils/api/axiosInstance'

type DocumentFormData = {
  name: string
  file: any[]
  document_type?: string | number | null
  note?: string | null
  client_list?: number[] | null
  case_list?: number[] | null
  clients?: number[] | null
  cases?: number[] | null
  client_info?: any[] | null
}

interface AddDocsModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: () => void
  title: string
  selectedClientData?: LawyerClientTypes
  mode?: 'create' | 'edit'
  docId?: number
  selectedDocumentData?: Partial<DocumentFormData>
}

const AddDocsModal = ({
  open,
  handleClose,
  title,
  selectedClientData,
  mode,
  docId,
  selectedDocumentData
}: AddDocsModalProps) => {
  const pathname = usePathname()

  // Api Call
  const { useCreateDocument, useUpdateDocument, getDocsType } = useDocsHooks()
  const { mutate: createDocument } = useCreateDocument()
  const { mutate: updateDocument } = useUpdateDocument()
  const { getLawyerClients } = useLawyerClientsHooks()
  const { useFetchClientTransactions } = useClientHooks()
  const { getCases } = useCasesHooks()
  const [selectedClients, setSelectedClients] = React.useState<any[]>([])
  const [selectedCases, setSelectedCases] = React.useState<any[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = React.useState<any[]>([])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors
  } = useForm<DocumentFormData>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      document_type: '',
      note: '',
      client_list: [],
      case_list: [],
      file: []
    }
  })

  const file = watch('file')
  const isLawyerClientPath = pathname?.startsWith('/en/dashboard/lawyer-client/')

  const fetchClientsByIds = async (clientsIds: number[]) => {
    if (!clientsIds?.length) {
      return []
    }

    try {
      const clientsPromises = clientsIds.map(id =>
        axiosInstance
          .get(
            `${isLawyerClientPath ? API_ROUTES.LAWYER_CLIENTS.getLawyerClients : API_ROUTES.TRANSACTION_SERVICES.getSingleClientTransaction}${id}/`,
            {
              requiresAuth: true,
              requiredPermission: `${isLawyerClientPath ? 'view_lawyerclient' : 'view_transclient'}`
            } as any
          )
          .then(res => res.data)
      )
      const clientsData = await Promise.all(clientsPromises)
      return clientsData
    } catch (error) {
      console.error('Error fetching clients:', error)
      return []
    }
  }

  React.useEffect(() => {
    const loadLawyerClients = async () => {
      if (mode === 'edit' && selectedDocumentData?.client_info?.length) {
        setSelectedClients(selectedDocumentData.client_info)
      } else if (mode === 'edit' && selectedDocumentData?.clients?.length) {
        const clientsData = await fetchClientsByIds(selectedDocumentData.clients)
        setSelectedClients(clientsData)
      } else {
        setSelectedClients([])
      }
    }

    const loadCases = async () => {
      if (mode === 'edit' && selectedDocumentData?.cases?.length) {
        const casesData = await fetchCasesByIds(selectedDocumentData.cases)
        setSelectedCases(casesData)
      } else {
        setSelectedCases([])
      }
    }

    const loadDocumentType = async () => {
      if (mode === 'edit' && selectedDocumentData?.document_type) {
        const documentType = await fetchDocumentType(Number(selectedDocumentData?.document_type))
        setSelectedDocumentType(documentType ? [documentType] : [])
      } else {
        setSelectedDocumentType([])
      }
    }

    loadLawyerClients()
    loadCases()
    loadDocumentType()
  }, [
    mode,
    selectedDocumentData?.client_info,
    selectedDocumentData?.clients,
    selectedDocumentData?.cases,
    selectedDocumentData?.document_type
  ])

  React.useEffect(() => {
    if (mode === 'edit' && selectedDocumentData) {
      setValue('document_type', selectedDocumentData.document_type || '')
      setValue('note', selectedDocumentData.note || '')
      setValue('name', selectedDocumentData.name || '')

      if (selectedDocumentData.client_info?.length) {
        const clientIds = selectedDocumentData.client_info.map((client: any) => client.id)
        setValue('client_list', clientIds)
      } else {
        setValue('client_list', selectedDocumentData.client_list || [])
      }

      setValue('case_list', selectedDocumentData.case_list || [])
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

  React.useEffect(() => {
    clearErrors()
  }, [clearErrors, open])

  React.useEffect(() => {
    if (mode === 'edit' && selectedClients.length > 0) {
      const clientIds = selectedClients.map((client: any) => client.id)
      setValue('client_list', clientIds)
    }
  }, [selectedClients, mode, setValue])

  const onSubmit: SubmitHandler<DocumentFormData> = async (data: DocumentFormData) => {
    clearErrors()
    let hasError = false
    if (!data.name?.trim()) {
      setError('name', { message: 'Name is required' })
      hasError = true
    }
    if (mode === 'create' && (!data.file || data.file.length === 0)) {
      setError('file', { message: 'File is required' })
      hasError = true
    }

    if (hasError) {
      return
    }

    const updatedClientList = selectedClientData?.id
      ? [...new Set([selectedClientData?.id, ...(data.client_list || [])])]
      : data.client_list || []

    if (mode === 'edit' && docId) {
      const payload: any = {}

      if (data.name !== selectedDocumentData?.name) {
        payload.name = data.name
      }
      if (data.document_type !== selectedDocumentData?.document_type) {
        payload.document_type = data.document_type || ''
      }
      if (data.note !== selectedDocumentData?.note) {
        payload.note = data.note || ''
      }
      if (JSON.stringify(updatedClientList) !== JSON.stringify(selectedDocumentData?.client_list)) {
        payload.clients = updatedClientList // Send as array for update
      }
      if (JSON.stringify(data.case_list) !== JSON.stringify(selectedDocumentData?.case_list)) {
        payload.cases = data.case_list || [] // Send as array for update
      }

      if (data.file?.[0] && data.file[0] instanceof File) {
        payload.file = data.file[0]
      }

      updateDocument(
        { id: docId, ...payload },
        {
          onSuccess: () => {
            handleCloseModal()
            toast.success(t('documents.documentUpdated'))
          }
        }
      )
    } else {
      const formattedClientList = updatedClientList.join(',')

      createDocument(
        {
          name: data.name,
          document_type: data.document_type,
          note: data.note ?? '',
          client_list: formattedClientList,
          case_list: (data.case_list || []).join(','),
          file: data.file?.[0]
        },
        {
          onSuccess: () => {
            toast.success(t('documents.documentCreated'))
            handleCloseModal()
          }
        }
      )
    }
  }

  const handleCloseModal = () => {
    handleClose()
    if (mode === 'create') {
      reset()
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
                setFiles={selectedFiles => {
                  setValue('file', selectedFiles)
                  if (selectedFiles.length > 0) {
                    clearErrors('file')
                  }
                }}
                register={register('file')}
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
                onChange={e => {
                  if (e.target.value.trim()) {
                    clearErrors('name')
                  }
                }}
              />
              <SearchableMultiSelect<DocumentFormData>
                options={getDocsType}
                name='document_type'
                register={register}
                returnAsArray={false}
                returnAsString={true}
                setValue={setValue}
                fieldError={errors.document_type}
                labelKey='name'
                value={watch('document_type') || ''}
                className='w-full'
                label={t('cases.form.types')}
                multiple={false}
                selectedOptionsList={mode === 'edit' ? selectedDocumentType : undefined}
              />
              <SearchableMultiSelect<DocumentFormData>
                options={
                  isLawyerClientPath
                    ? (pageSize, page, search) => getLawyerClients(pageSize, page, search, 'client', undefined, true)
                    : (pageSize, page, search) =>
                        useFetchClientTransactions(pageSize, page, search, 'client', undefined, true)
                }
                name='client_list'
                returnAsArray={true}
                returnAsString={false}
                register={register}
                setValue={setValue}
                fieldError={errors.client_list}
                labelKey='first_name'
                value={watch('client_list') || []}
                className='w-full'
                label={t('cases.form.clients')}
                multiple={true}
                defaultOption={
                  selectedClientData
                    ? { id: selectedClientData?.id, first_name: selectedClientData?.first_name }
                    : undefined
                }
                selectedOptionsList={mode === 'edit' ? selectedClients : undefined}
                showStatusBadge={true}
              />
              {pathname?.startsWith('/en/dashboard/lawyer-client/') && (
                <SearchableMultiSelect<DocumentFormData>
                  options={getCases}
                  name='case_list'
                  returnAsArray={true}
                  returnAsString={false}
                  register={register}
                  setValue={setValue}
                  fieldError={errors.case_list}
                  labelKey='title'
                  value={watch('case_list') || []}
                  className='w-full'
                  label='Cases'
                  multiple={true}
                  selectedOptionsList={mode === 'edit' ? selectedCases : undefined}
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
                  '& .MuiOutlinedInput-root': {
                    height: 'auto'
                  }
                }}
                onBlur={e => {
                  if (!e.target.value.trim()) {
                    setValue('note', null, { shouldValidate: true })
                  }
                }}
              />

              <div className='w-full flex justify-end'>
                <Button
                  variant='contained'
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                  type='submit'
                >
                  {mode === 'edit' ? t('cases.form.updateDocument') : t('documents.addNew')}
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
