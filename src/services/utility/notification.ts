import type {
  CreateNotificationType,
  CreateNotificationTemplateType,
  UpdateNotificationPreferenceType,
  SendNotificationType
} from '@/types/notificationTypes'

export const mapCreateNotificationData = (data: CreateNotificationType) => ({
  type: data.type,
  title: data.title,
  message: data.message,
  recipient_id: data.recipient_id,
  metadata: data.metadata
})

export const mapCreateNotificationTemplateData = (data: CreateNotificationTemplateType) => ({
  name: data.name,
  description: data.description,
  type: data.type,
  title_template: data.title_template,
  message_template: data.message_template,
  variables: data.variables
})

export const mapUpdateNotificationTemplateData = (data: Partial<CreateNotificationTemplateType>) => {
  const updateData: Partial<CreateNotificationTemplateType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.type) updateData.type = data.type
  if (data.title_template) updateData.title_template = data.title_template
  if (data.message_template) updateData.message_template = data.message_template
  if (data.variables) updateData.variables = data.variables

  return updateData
}

export const mapUpdateNotificationPreferenceData = (data: UpdateNotificationPreferenceType) => ({
  id: data.id,
  is_enabled: data.is_enabled
})

export const mapSendNotificationData = (data: SendNotificationType) => ({
  template_id: data.template_id,
  recipient_ids: data.recipient_ids,
  variables: data.variables
})
