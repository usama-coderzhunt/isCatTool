import * as React from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { useBusinessUnitHooks } from '@/services/useBusinessUnitHooks'

interface BusinessUnitAssignToUserModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  userId: number
}

interface BusinessUnitAssignToUserForm {
  business_unit: string | undefined
}

const BusinessUnitAssignToUserModal: React.FC<BusinessUnitAssignToUserModalProps> = ({
  open,
  handleClose,
  title,
  userId
}) => {
  const { t } = useTranslation('global')
  const { getBusinessUnits, useBusinessUnitAssignToUser } = useBusinessUnitHooks()
  const { mutate: addBusinessUnitAssignToUser, isSuccess: isBusinessUnitAssigned } = useBusinessUnitAssignToUser()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors }
  } = useForm<BusinessUnitAssignToUserForm>({
    defaultValues: {
      business_unit: undefined
    },
    mode: 'onSubmit'
  })

  React.useEffect(() => {
    if (isBusinessUnitAssigned) {
      handleCloseModal()
    }
  }, [isBusinessUnitAssigned])

  const onSubmit: SubmitHandler<BusinessUnitAssignToUserForm> = (data: BusinessUnitAssignToUserForm) => {
    if (!data.business_unit) {
      toast.error(t('businessUnitAssignToUserModal.toasts.pleaseSelectBusinessUnit'))
      return
    }

    addBusinessUnitAssignToUser({
      id: userId,
      business_unit: data.business_unit
    })
  }

  const handleCloseModal = () => {
    reset()
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
            <Typography variant='h4'>{title}</Typography>
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
              {/* Translation Model */}
              <div className='w-full'>
                <Controller
                  control={control}
                  name='business_unit'
                  rules={{
                    required: 'Business unit is required'
                  }}
                  render={({ field }) => (
                    <SearchableMultiSelect<any>
                      options={getBusinessUnits}
                      name='business_unit'
                      register={register}
                      returnAsArray={false}
                      returnAsString={false}
                      setValue={setValue}
                      fieldError={errors.business_unit}
                      labelKey='name'
                      value={watch('business_unit') || undefined}
                      className='w-full'
                      label={t('businessUnitAssignToUserModal.businessUnit')}
                      multiple={false}
                      showAsterisk={true}
                    />
                  )}
                />
              </div>
            </div>
            {/* Submit Button */}
            <div className='w-full flex justify-end gap-x-2'>
              <Button
                variant='outlined'
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
                onClick={handleCloseModal}
              >
                {t('businessUnitAssignToUserModal.cancel')}
              </Button>
              <Button
                variant='contained'
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
                type='submit'
              >
                {t('businessUnitAssignToUserModal.btnText')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default BusinessUnitAssignToUserModal
