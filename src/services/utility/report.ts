import type {
  CreateReportTemplateType,
  UpdateReportTemplateType,
  GenerateReportType,
  CreateReportScheduleType,
  UpdateReportScheduleType
} from '@/types/reportTypes'

export const mapCreateReportTemplateData = (data: CreateReportTemplateType) => ({
  name: data.name,
  description: data.description,
  type: data.type,
  config: data.config
})

export const mapUpdateReportTemplateData = (data: Partial<CreateReportTemplateType>) => {
  const updateData: Partial<CreateReportTemplateType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.type) updateData.type = data.type
  if (data.config) updateData.config = data.config

  return updateData
}

export const mapGenerateReportData = (data: GenerateReportType) => ({
  parameters: data.parameters
})

export const mapCreateReportScheduleData = (data: CreateReportScheduleType) => ({
  template_id: data.template_id,
  name: data.name,
  schedule: data.schedule,
  parameters: data.parameters,
  is_active: data.is_active ?? true
})

export const mapUpdateReportScheduleData = (data: Partial<CreateReportScheduleType>) => {
  const updateData: Partial<CreateReportScheduleType> = {}

  if (data.name) updateData.name = data.name
  if (data.schedule) updateData.schedule = data.schedule
  if (data.parameters !== undefined) updateData.parameters = data.parameters
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  return updateData
}
