import type {
  CreateIntegrationType,
  UpdateIntegrationType,
  CreateWebhookType,
  UpdateWebhookType,
  CreateApiKeyType
} from '@/types/integrationType'

export const mapCreateIntegrationData = (data: CreateIntegrationType) => ({
  name: data.name,
  provider: data.provider,
  type: data.type,
  config: data.config
})

export const mapUpdateIntegrationData = (data: Partial<CreateIntegrationType>) => {
  const updateData: Partial<CreateIntegrationType> = {}

  if (data.name) updateData.name = data.name
  if (data.provider) updateData.provider = data.provider
  if (data.type) updateData.type = data.type
  if (data.config) updateData.config = data.config

  return updateData
}

export const mapCreateWebhookData = (data: CreateWebhookType) => ({
  integration_id: data.integration_id,
  event: data.event,
  url: data.url,
  headers: data.headers,
  is_active: data.is_active ?? true
})

export const mapUpdateWebhookData = (data: Partial<CreateWebhookType>) => {
  const updateData: Partial<CreateWebhookType> = {}

  if (data.event) updateData.event = data.event
  if (data.url) updateData.url = data.url
  if (data.headers !== undefined) updateData.headers = data.headers
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  return updateData
}

export const mapCreateApiKeyData = (data: CreateApiKeyType) => ({
  integration_id: data.integration_id,
  name: data.name,
  expires_at: data.expires_at
})
