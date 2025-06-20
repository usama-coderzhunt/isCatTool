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
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import { useLawyerClientsHooks } from '@/services/lawyerClients'
import { toast } from 'react-toastify'
import { CaseTypes } from '@/types/cases'
import { useCasesHooks } from '@/services/useCases'
import { createCaseSchema } from '@/utils/schemas/createCaseSchema'
import SearchableMultiSelect from '../common/SearchableMultiSelect'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useStaffHooks } from '@/services/useStaffHooks'
import { fetchCaseTypesByIds, fetchClientsByIds, fetchStaffsByIds } from '@/services/utility/case'

interface AddCasesModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  caseData?: CaseTypes | null
  mode: string | null
  selectedClients?: any
  clientId?: number
}

const AddCasesModal: React.FC<AddCasesModalProps> = ({
  open,
  handleClose,
  caseData,
  mode,
  selectedClients,
  clientId
}) => {
  const { t } = useTranslation('global')

  // hooks
  const { useCreateCase, useEditCase, getCaseTypes } = useCasesHooks()
  const { getLawyerClients } = useLawyerClientsHooks()
  const { useStaffMembers } = useStaffHooks()

  const { mutate: editCase } = useEditCase()
  const { mutate: createCase } = useCreateCase()
  const [clients, setClients] = React.useState<any[]>([])
  const [selectedCaseTypes, setSelectedCaseTypes] = React.useState<any[]>([])
  const [selectedStaffs, setSelectedStaffs] = React.useState<any[]>([])
  const [selectedCaseClients, setSelectedCaseClients] = React.useState<any[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CaseTypes>({
    resolver: zodResolver(createCaseSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      summary: '',
      cost_amount: '',
      types: [],
      clients: clientId ? [clientId] : [],
      staffs: [],
      payment_schedule: ''
    }
  })

  // Fetch case types, clients, and staffs when editing
  React.useEffect(() => {
    const fetchAll = async () => {
      if (open && mode === 'edit' && caseData) {
        const [typesData, clientsData, staffsData] = await Promise.all([
          caseData.types?.length ? fetchCaseTypesByIds(caseData.types) : [],
          caseData.clients?.length ? fetchClientsByIds(caseData.clients) : [],
          caseData.staffs?.length ? fetchStaffsByIds(caseData.staffs) : []
        ])
        setSelectedCaseTypes(typesData)
        setSelectedCaseClients(clientsData)
        setSelectedStaffs(staffsData)
      } else if (mode === 'edit' && !caseData) {
        setSelectedCaseTypes([])
        setSelectedCaseClients([])
        setSelectedStaffs([])
      }
    }

    fetchAll()
  }, [open, mode, caseData])

  React.useEffect(() => {
    if (mode === 'edit' && caseData) {
      setValue('title', caseData.title)
      setValue('summary', caseData.summary)
      setValue('cost_amount', caseData.cost_amount)
      setValue('types', caseData.types)
      setValue('clients', clientId ? [clientId] : caseData.clients || [])
      setValue('staffs', caseData.staffs || [])

      setValue('payment_schedule', caseData.payment_schedule || '')
    } else if (mode === 'create') {
      reset({
        title: '',
        summary: '',
        cost_amount: '',
        types: [],
        clients: clientId ? [clientId] : [],
        staffs: [],
        payment_schedule: ''
      })
    }
  }, [caseData, mode, setValue, clientId, reset])

  const onSubmit: SubmitHandler<CaseTypes> = (data: any) => {
    const formData = {
      ...data,
      clients: clientId ? [clientId] : data.clients
    }

    if (mode === 'create') {
      createCase(formData as CaseTypes, {
        onSuccess: () => {
          toast.success(t('cases.form.createCaseSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && caseData?.id) {
      editCase(
        { id: Number(caseData?.id), ...formData },
        {
          onSuccess: () => {
            toast.success(t('cases.form.updateCaseSuccess'))
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
        <Box sx={modalStyles}>
          <div className='flex gap-x-2 justify-between items-center mb-6'>
            <Typography variant='h4'>
              {mode === 'create' ? t('cases.form.createCase') : t('cases.form.updateCase')}
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
            <div className='w-full grid grid-cols-12 gap-6'>
              {/* Title */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('cases.form.title')}
                  type='text'
                  {...register('title')}
                  defaultValue={caseData?.title || ''}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Cost */}
              <div className='col-span-6 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('cases.form.cost')}
                  type='number'
                  {...register('cost_amount', { valueAsNumber: true })}
                  defaultValue={caseData?.cost_amount || ''}
                  error={!!errors.cost_amount}
                  helperText={errors.cost_amount?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Types */}
              <div className='col-span-6'>
                <SearchableMultiSelect<CaseTypes>
                  options={getCaseTypes}
                  name='types'
                  returnAsArray={true}
                  returnAsString={false}
                  register={register}
                  setValue={setValue}
                  fieldError={errors.types}
                  labelKey='name'
                  value={watch('types') || []}
                  className='w-full'
                  label={t('cases.form.types')}
                  multiple={true}
                  showAsterisk={true}
                  selectedOptionsList={mode === 'edit' ? selectedCaseTypes : undefined}
                />
              </div>

              {/* Clients */}
              {!clientId && (
                <div className='col-span-6'>
                  <SearchableMultiSelect<CaseTypes>
                    options={(pageSize, page, search) =>
                      getLawyerClients(pageSize, page, search, undefined, undefined, true)
                    }
                    name='clients'
                    returnAsArray={true}
                    returnAsString={false}
                    register={register}
                    setValue={setValue}
                    fieldError={errors.clients}
                    labelKey='first_name'
                    value={watch('clients') || []}
                    className='w-full'
                    label={t('cases.form.clients')}
                    multiple={true}
                    selectedOptionsList={mode === 'edit' ? selectedCaseClients : undefined}
                    showAsterisk={true}
                  />
                </div>
              )}

              {/* Staff */}
              <div className='col-span-6'>
                <SearchableMultiSelect<CaseTypes>
                  options={useStaffMembers}
                  name='staffs'
                  returnAsArray={true}
                  returnAsString={false}
                  register={register}
                  setValue={setValue}
                  fieldError={errors.staffs}
                  labelKey='first_name'
                  value={watch('staffs') || []}
                  className='w-full'
                  label={t('cases.form.staff')}
                  multiple={true}
                  selectedOptionsList={mode === 'edit' ? selectedStaffs : undefined}
                />
              </div>

              {/* Payment Schedule */}
              <div className='col-span-12'>
                <CustomTextField
                  autoFocus
                  fullWidth
                  id='payment_schedule'
                  label={t('cases.form.paymentSchedule')}
                  type='text'
                  multiline
                  minRows={3}
                  maxRows={4}
                  {...register('payment_schedule')}
                  defaultValue={caseData?.payment_schedule || ''}
                  error={!!errors.payment_schedule}
                  helperText={errors.payment_schedule?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 'auto'
                    }
                  }}
                />
              </div>

              {/* Summary */}
              <div className='col-span-12'>
                <CustomTextField
                  autoFocus
                  fullWidth
                  id='summary'
                  label={t('cases.form.summary')}
                  type='text'
                  multiline
                  showAsterisk={true}
                  minRows={3}
                  maxRows={4}
                  {...register('summary')}
                  error={!!errors.summary}
                  helperText={errors.summary?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 'auto'
                    }
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            {(mode === 'create' || mode === 'edit') && (
              <div className='w-full flex justify-end'>
                <Button
                  variant='contained'
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                  type='submit'
                >
                  {mode === 'create' ? t('cases.form.createCase') : t('cases.form.updateCase')}
                </Button>
              </div>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddCasesModal
