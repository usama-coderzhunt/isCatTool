import type { CreatePageType, UpdatePageType, CreatePageComponentType, UpdateComponentType } from '@/types/pageTypes'

export const mapCreatePageData = (data: CreatePageType) => ({
  title: data.title,
  slug: data.slug,
  is_homepage: data.is_homepage
})

export const mapUpdatePageData = (data: Partial<CreatePageType>) => {
  const updateData: Partial<CreatePageType> = {}

  if (data.title) updateData.title = data.title
  if (data.slug) updateData.slug = data.slug
  if (data.is_homepage !== undefined) updateData.is_homepage = data.is_homepage

  return updateData
}

export const mapCreateComponentData = (data: CreatePageComponentType) => ({
  type: data.type,
  order: data.order,
  content: data.content,
  styles: data.styles
})

export const mapUpdateComponentData = (data: Partial<CreatePageComponentType>) => {
  const updateData: Partial<CreatePageComponentType> = {}

  if (data.type) updateData.type = data.type
  if (data.order !== undefined) updateData.order = data.order
  if (data.content) updateData.content = data.content
  if (data.styles !== undefined) updateData.styles = data.styles

  return updateData
}
