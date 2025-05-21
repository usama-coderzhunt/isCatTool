'use client'

import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import {
  Backdrop,
  Box,
  Modal,
  Fade,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useServicesHooks } from '@/services/useServicesHooks'
import CustomTextField from '@/@core/components/mui/TextField'
import { modalStyles } from '@/utils/constants/modalsStyles'
import HTMLEditor from '@/components/common/htmlEditor'
import ImageUploader from '@/components/common/ImageUploader'
import KeyValuePairInput from '@/components/common/KeyValuePairInput'
import { KeyValuePair } from 'tailwindcss/types/config'

interface AddServiceModalProps {
  open: boolean
  handleClose: () => void
  serviceData?: any
  serviceID?: number | null
  mode: 'view' | 'create' | 'edit'
  title: string
}

const AddServiceModal = ({ open, handleClose, serviceData, serviceID, mode, title }: AddServiceModalProps) => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  React.useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const { useCreateService, useEditService, getAllCategories } = useServicesHooks()
  const { mutate: createService, isLoading: isCreating } = useCreateService()
  const { mutate: editService, isLoading: isEditing } = useEditService()
  const { data: categories, isLoading: isCategoriesLoading } = getAllCategories()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      categories: '',
      short_description: '',
      image: null,
      clients: [],
      features_list: {},
      limit_list: {}
    }
  })

  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [currentImage, setCurrentImage] = React.useState<File | null>(null);

  const handleFeaturesListChange = (pairs: KeyValuePair[], onChange: (value: any) => void) => {
    const newFeaturesList = pairs.reduce((acc, { key, value }) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
    onChange(newFeaturesList);
  };

  const handleLimitsListChange = (pairs: KeyValuePair[], onChange: (value: any) => void) => {
    const newLimitsList = pairs.reduce((acc, { key, value }) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
    onChange(newLimitsList);
  };

  React.useEffect(() => {
    if (serviceData && (mode === 'edit' || mode === 'view')) {
      let description = serviceData.description || '';
      let shortDescription = serviceData.short_description || '';

      if (serviceData.image) {
        setPreviewImage(serviceData.image);
      }

      reset({
        name: serviceData.name,
        description: description,
        categories: serviceData.categories?.[0] || '',
        short_description: shortDescription,
        image: null,
        clients: [],
        features_list: serviceData.features_list || {},
        limit_list: serviceData.limit_list || {}
      })
    }
  }, [serviceData, mode, reset])

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setCurrentImage(file);
    } else {
      setPreviewImage(null);
      setCurrentImage(null);
    }
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('categories', data.categories);
    formData.append('short_description', data.short_description);
    formData.append('clients', JSON.stringify([]));
    formData.append('features_list', JSON.stringify(data.features_list));
    formData.append('limit_list', JSON.stringify(data.limit_list));

    // Handle image upload
    if (currentImage) {
      formData.append('image', currentImage);
    } else if (mode === 'create') {
      throw new Error('Please select an image file');
    }

    if (mode === 'create') {
      createService(formData, {
        onSuccess: () => {
          handleClose()
          handleModalClose()
          reset()
          setPreviewImage(null)
          setCurrentImage(null)
        }
      })
    } else if (mode === 'edit' && serviceID) {
      editService(
        { id: serviceID, data: formData },
        {
          onSuccess: () => {
            handleClose()
            handleModalClose()
            reset()
            setPreviewImage(null)
            setCurrentImage(null)
          }
        }
      )
    }
  }

  const handleModalClose = () => {
    reset({
      name: '',
      description: '',
      categories: '',
      short_description: '',
      image: null,
      clients: [],
      features_list: {},
      limit_list: {}
    })
    setPreviewImage(null)
    setCurrentImage(null)
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
        <Box sx={{
          ...modalStyles,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: '800px',
          maxHeight: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
          m: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 4,
        }}>
          <div className='flex gap-x-2 justify-between items-center mb-4 sticky top-[-16px] bg-white z-50 pb-2 border-b mx-[-16px] px-4'>
            <Typography variant='h4'>{title}</Typography>
            <Button
              onClick={handleModalClose}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <Box sx={{
            overflowY: 'auto',
            pr: 4,
            mr: -4,
            pt: 2,
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.300',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'grey.100'
            }
          }}>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <div className='w-full grid grid-cols-12 gap-6'>
                {/* Name */}
                <div className='col-span-6'>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: t('validation.required') }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label={t('services.name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={mode === 'view'}
                        fullWidth
                        showAsterisk={true}
                        sx={{
                          '& .MuiInputLabel-root': {
                            background: 'white',
                            padding: '0 4px',
                          },
                          '& .MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }}
                      />
                    )}
                  />
                </div>

                {/* Category */}
                <div className='col-span-6'>
                  <Controller
                    name='categories'
                    control={control}
                    rules={{ required: t('validation.required') }}
                    render={({ field }) => (
                      <FormControl error={!!errors.categories} fullWidth>
                        <InputLabel
                          sx={{
                            '& .MuiInputLabel-asterisk': {
                              color: 'error.main'
                            }
                          }}
                          required
                          shrink
                        >
                          {t('services.category')}
                        </InputLabel>
                        <Select
                          {...field}
                          label={t('services.category')}
                          required
                          disabled={mode === 'view' || isCategoriesLoading}
                          notched
                        >
                          {categories?.map((category: any) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.categories && <FormHelperText>{errors.categories.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </div>

                {/* Image Upload */}
                <div className='col-span-12'>
                  <Controller
                    name='image'
                    control={control}
                    rules={{ required: mode === 'create' ? 'Image is required' : false }}
                    render={({ field: { value, onChange, ...field } }) => (
                      <ImageUploader
                        value={mode === 'edit' && serviceData?.image ? serviceData.image : currentImage}
                        onChange={(file) => {
                          onChange(file);
                          handleImageChange(file);
                        }}
                        label={t('services.image')}
                        error={!!errors.image}
                        helperText={errors.image?.message}
                      />
                    )}
                  />
                </div>

                {/* Features List */}
                <div className='col-span-12'>
                  <Controller
                    name='features_list'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <KeyValuePairInput
                        pairs={Object.entries(value).map(([key, value]) => ({
                          key,
                          value: value as string,
                          type: 'string'
                        }))}
                        onChange={(newPairs) => handleFeaturesListChange(newPairs as any, onChange)}
                        disabled={mode === 'view'}
                        showTypeSelector={false}
                        label={t('keyValuePair.featuresList')}
                      />
                    )}
                  />
                </div>

                {/* Limits List */}
                <div className='col-span-12'>
                  <div className='col-span-12'>
                    <Controller
                      name='limit_list'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <KeyValuePairInput
                          pairs={Object.entries(value).map(([key, value]) => ({
                            key,
                            value: value as string,
                            type: 'string'
                          }))}
                          onChange={(newPairs) => handleLimitsListChange(newPairs as any, onChange)}
                          disabled={mode === 'view'}
                          showTypeSelector={false}
                          label={t('keyValuePair.limitsList')}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className='col-span-12'>
                  <Controller
                    name='short_description'
                    control={control}
                    rules={{
                      required: t('validation.required'),
                    }}
                    render={({ field: { value, onChange, ...field } }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('services.shortDescription')} <span className="text-red-500">*</span>
                        </label>
                        <HTMLEditor
                          value={value}
                          onChange={onChange}
                          disabled={mode === 'view'}
                          height="150px"
                        />
                        {errors.short_description && (
                          <p className="text-red-500 text-sm mt-1">{errors.short_description?.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

              </div>
              {/* Description */}
              <div className='col-span-12'>
                <Controller
                  name='description'
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field: { value, onChange, ...field } }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('services.description')} <span className="text-red-500">*</span>
                      </label>
                      <HTMLEditor
                        value={value}
                        onChange={onChange}
                        disabled={mode === 'view'}
                        height="200px"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description?.message}</p>
                      )}
                    </div>
                  )}
                />
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
                    disabled={isCreating || isEditing}
                  >
                    {mode === 'create' ? t('services.createService') : t('services.updateService')}
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

export default AddServiceModal
