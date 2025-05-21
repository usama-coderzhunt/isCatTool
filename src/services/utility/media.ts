import type {
  CreateMediaType,
  UpdateMediaType,
  CreateMediaCategoryType,
  UpdateMediaCategoryType,
  CreateMediaProcessingType
} from '@/types/mediaTypes'

export const mapCreateMediaData = (data: CreateMediaType) => {
  const formData = new FormData()

  formData.append('name', data.name)
  formData.append('file', data.file)
  if (data.category) formData.append('category', data.category)
  if (data.tags) formData.append('tags', JSON.stringify(data.tags))
  if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))

  return formData
}

export const mapUpdateMediaData = (data: Partial<Omit<CreateMediaType, 'file'>>) => {
  const updateData: Partial<Omit<CreateMediaType, 'file'>> = {}

  if (data.name) updateData.name = data.name
  if (data.category !== undefined) updateData.category = data.category
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.metadata !== undefined) updateData.metadata = data.metadata

  return updateData
}

export const mapCreateMediaCategoryData = (data: CreateMediaCategoryType) => ({
  name: data.name,
  description: data.description,
  parent_id: data.parent_id
})

export const mapUpdateMediaCategoryData = (data: Partial<CreateMediaCategoryType>) => {
  const updateData: Partial<CreateMediaCategoryType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id

  return updateData
}

export const mapCreateMediaProcessingData = (data: CreateMediaProcessingType) => ({
  media_id: data.media_id,
  operation: data.operation,
  parameters: data.parameters
})
