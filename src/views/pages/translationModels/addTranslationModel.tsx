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
import { TranslationModelsTypes } from '@/types/translationModelTypes'
import { useTranslationModelsHooks } from '@/services/useTranslationModelsHooks'
import { createTranslationModelSchema, TranslationModelSchema } from '@/utils/schemas/translationModelSchema'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { useLlmOperatorsHooks } from '@/services/useLlmOperatorsHooks'
import { fetchAllowedGroupsByIds, fetchAllowedUsersByIds, fetchOperator } from '@/services/utility/translationModel'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'

interface AddTranslationModelsModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'create' | 'edit', translationModel?: TranslationModelsTypes) => void
  title: string
  translationModelData?: TranslationModelsTypes | null
  mode: 'create' | 'edit'
}

const AddTranslationModel: React.FC<AddTranslationModelsModalProps> = ({
  open,
  handleClose,
  title,
  translationModelData,
  mode
}) => {
  const { t } = useTranslation('global')
  const PAGE_SIZE = 10

  //states
  const [selectedOperator, setSelectedOperator] = React.useState<TranslationModelsTypes[]>([])
  const [selectedAllowedUsers, setSelectedAllowedUsers] = React.useState<TranslationModelsTypes[]>([])
  const [selectedAllowedGroups, setSelectedAllowedGroups] = React.useState<TranslationModelsTypes[]>([])

  // Api Call
  const { useCreateTranslationModel, useEditTranslationModels } = useTranslationModelsHooks()
  const { getLlmOperators } = useLlmOperatorsHooks()
  const { useUsers, useGroupsTM } = useUserManagementHooks()
  const { mutate: createTranslationModel } = useCreateTranslationModel()
  const { mutate: editTranslationModel } = useEditTranslationModels()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors }
  } = useForm<TranslationModelSchema>({
    resolver: zodResolver(createTranslationModelSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      model_name: '',
      description: '',
      operator: undefined,
      allowed_users: [],
      allowed_groups: []
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && translationModelData) {
      setValue('name', translationModelData.name)
      setValue('description', translationModelData.description)
      setValue('model_name', translationModelData.model_name)
      setValue('operator', translationModelData.operator)
      setValue('allowed_users', translationModelData.allowed_users)
      setValue('allowed_groups', translationModelData.allowed_groups)
    }
  }, [translationModelData, mode, setValue])

  React.useEffect(() => {
    const fetchAll = async () => {
      if (open && mode === 'edit' && translationModelData) {
        const operator = await fetchOperator(Number(translationModelData?.operator))
        setSelectedOperator(operator ? [operator] : [])
        const [allowedUsersData, allowedGroupsData] = await Promise.all([
          translationModelData.allowed_users?.length ? fetchAllowedUsersByIds(translationModelData?.allowed_users) : [],
          translationModelData?.allowed_groups.length
            ? fetchAllowedGroupsByIds(translationModelData?.allowed_groups)
            : []
        ])
        setSelectedAllowedUsers(allowedUsersData)
        setSelectedAllowedGroups(allowedGroupsData)
      } else if (mode === 'edit' && !translationModelData) {
        setSelectedOperator([])
        setSelectedAllowedUsers([])
        setSelectedAllowedGroups([])
      }
    }
    fetchAll()
  }, [mode, translationModelData])

  const onSubmit: SubmitHandler<TranslationModelSchema> = data => {
    if (mode === 'create') {
      createTranslationModel(data, {
        onSuccess: () => {
          toast.success(t('translationModels.toasts.translationModelCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && translationModelData?.id) {
      editTranslationModel(
        { id: translationModelData.id, ...data },
        {
          onSuccess: () => {
            toast.success(t('translationModels.toasts.translationModelUpdatedSuccess'))
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
              {/* Name */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('translationModels.form.name')}
                  type='text'
                  {...register('name')}
                  defaultValue={translationModelData?.name || null}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  showAsterisk={true}
                />
              </div>

              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('translationModels.form.modelName')}
                  type='text'
                  {...register('model_name')}
                  defaultValue={translationModelData?.model_name || null}
                  error={!!errors.model_name}
                  helperText={errors.model_name?.message}
                  showAsterisk={true}
                />
              </div>

              <div className='col-span-6'>
                <SearchableMultiSelect<TranslationModelSchema>
                  options={getLlmOperators}
                  name='operator'
                  returnAsArray={false}
                  returnAsString={false}
                  register={register}
                  setValue={setValue}
                  fieldError={errors.operator}
                  labelKey='name'
                  value={watch('operator') || undefined}
                  className='w-full'
                  label={t('translationModels.form.operator')}
                  multiple={false}
                  showAsterisk={true}
                  selectedOptionsList={mode === 'edit' ? selectedOperator : undefined}
                />
              </div>

              <div className='col-span-6'>
                <SearchableMultiSelect<TranslationModelSchema>
                  options={useUsers}
                  name='allowed_users'
                  returnAsArray={true}
                  returnAsString={false}
                  register={register}
                  setValue={setValue}
                  fieldError={errors.allowed_users}
                  labelKey='username'
                  value={watch('allowed_users') || []}
                  className='w-full'
                  label={t('translationModels.form.allowedUsers')}
                  multiple={true}
                  selectedOptionsList={mode === 'edit' ? selectedAllowedUsers : undefined}
                />
              </div>

              <div className='col-span-6'>
                <SearchableMultiSelect<TranslationModelSchema>
                  options={useGroupsTM}
                  name='allowed_groups'
                  returnAsArray={true}
                  returnAsString={false}
                  register={register}
                  setValue={setValue}
                  fieldError={errors.allowed_groups}
                  labelKey='name'
                  value={watch('allowed_groups') || []}
                  className='w-full'
                  label={t('translationModels.form.allowedGroups')}
                  multiple={true}
                  selectedOptionsList={mode === 'edit' ? selectedAllowedGroups : undefined}
                />
              </div>

              {/* Description */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('translationModels.form.description')}
                  type='text'
                  {...register('description')}
                  defaultValue={translationModelData?.description || null}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  autoFocus
                  id='description'
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
                {mode === 'create' ? t('translationModels.form.add') : t('translationModels.form.edit')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddTranslationModel
