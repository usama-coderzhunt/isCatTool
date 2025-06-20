import type { CreateSettingType, UpdateSettingType, CreateSettingCategoryType } from '@/types/settingTypes'

export const mapCreateSettingData = (data: CreateSettingType) => ({
  key: data.key,
  value: data.value,
  data_type: data.data_type,
  description: data.description,
  category: data.category,
  is_public: data.is_public ?? false
})

export const mapUpdateSettingData = (data: UpdateSettingType) => {
  const updateData: Partial<CreateSettingType> = {}

  if (data.key) updateData.key = data.key
  if (data.value !== undefined) updateData.value = data.value
  if (data.data_type) updateData.data_type = data.data_type
  if (data.description !== undefined) updateData.description = data.description
  if (data.category) updateData.category = data.category
  if (data.is_public !== undefined) updateData.is_public = data.is_public

  return updateData
}

export const mapCreateSettingCategoryData = (data: CreateSettingCategoryType) => ({
  name: data.name,
  description: data.description
})
