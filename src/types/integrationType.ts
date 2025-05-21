// Integration Types
export interface IntegrationType {
  id: number
  name: string
  provider: string
  type: 'oauth' | 'api_key' | 'webhook'
  config: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  last_sync?: string
  error_message?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateIntegrationType {
  name: string
  provider: string
  type: 'oauth' | 'api_key' | 'webhook'
  config: Record<string, any>
}

export interface UpdateIntegrationType extends Partial<CreateIntegrationType> {
  id: number
}

// Webhook Types
export interface WebhookType {
  id: number
  integration_id: number
  event: string
  url: string
  headers?: Record<string, string>
  is_active: boolean
  last_triggered?: string
  created_at: string
  updated_at: string
}

export interface CreateWebhookType {
  integration_id: number
  event: string
  url: string
  headers?: Record<string, string>
  is_active?: boolean
}

export interface UpdateWebhookType extends Partial<CreateWebhookType> {
  id: number
}

// API Key Types
export interface ApiKeyType {
  id: number
  integration_id: number
  key: string
  name: string
  expires_at?: string
  last_used?: string
  created_at: string
  created_by?: number
}

export interface CreateApiKeyType {
  integration_id: number
  name: string
  expires_at?: string
}
