import type {
  CreateTagType,
  UpdateTagType,
  CreateTagAssignmentType,
  CreateTagCategoryType,
  UpdateTagCategoryType
} from '@/types/tagTypes'

export const mapCreateTagData = (data: CreateTagType) => ({
  name: data.name,
  description: data.description,
  category: data.category,
  color: data.color,
  icon: data.icon
})

export const mapUpdateTagData = (data: Partial<CreateTagType>) => {
  const updateData: Partial<CreateTagType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.color !== undefined) updateData.color = data.color
  if (data.icon !== undefined) updateData.icon = data.icon

  return updateData
}

export const mapCreateTagAssignmentData = (data: CreateTagAssignmentType) => ({
  tag_id: data.tag_id,
  entity_type: data.entity_type,
  entity_id: data.entity_id
})

export const mapCreateTagCategoryData = (data: CreateTagCategoryType) => ({
  name: data.name,
  description: data.description,
  parent_id: data.parent_id
})

export const mapUpdateTagCategoryData = (data: Partial<CreateTagCategoryType>) => {
  const updateData: Partial<CreateTagCategoryType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id

  return updateData
}
