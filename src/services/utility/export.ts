import type {
  CreateExportJobType,
  CreateImportJobType,
  CreateImportTemplateType,
  UpdateImportTemplateType
} from '@/types/exportTypes'

export const mapCreateExportJobData = (data: CreateExportJobType) => ({
  type: data.type,
  format: data.format,
  filters: data.filters
})

export const mapCreateImportJobData = (data: CreateImportJobType) => {
  const formData = new FormData()

  formData.append('type', data.type)
  formData.append('file', data.file)

  return formData
}

export const mapCreateImportTemplateData = (data: CreateImportTemplateType) => ({
  type: data.type,
  name: data.name,
  description: data.description,
  fields: data.fields
})

export const mapUpdateImportTemplateData = (data: Partial<CreateImportTemplateType>) => {
  const updateData: Partial<CreateImportTemplateType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.fields) updateData.fields = data.fields

  return updateData
}
