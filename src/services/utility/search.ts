import type { SearchQueryType, CreateFilterType, UpdateFilterType } from '@/types/searchTypes'

export const mapSearchQueryData = (data: SearchQueryType) => ({
  query: data.query,
  types: data.types,
  from_date: data.from_date,
  to_date: data.to_date,
  page: data.page,
  page_size: data.page_size
})

export const mapCreateFilterData = (data: CreateFilterType) => ({
  name: data.name,
  type: data.type,
  criteria: data.criteria,
  is_public: data.is_public ?? false
})

export const mapUpdateFilterData = (data: Partial<CreateFilterType>) => {
  const updateData: Partial<CreateFilterType> = {}

  if (data.name) updateData.name = data.name
  if (data.type) updateData.type = data.type
  if (data.criteria) updateData.criteria = data.criteria
  if (data.is_public !== undefined) updateData.is_public = data.is_public

  return updateData
}
