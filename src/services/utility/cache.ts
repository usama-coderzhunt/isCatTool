import type { CreateCacheConfigType, UpdateCacheConfigType, CreateCacheOperationType } from '@/types/cacheTypes'

export const mapCreateCacheConfigData = (data: CreateCacheConfigType) => ({
  key: data.key,
  ttl: data.ttl,
  max_size: data.max_size,
  strategy: data.strategy,
  is_enabled: data.is_enabled ?? true
})

export const mapUpdateCacheConfigData = (data: Partial<CreateCacheConfigType>) => {
  const updateData: Partial<CreateCacheConfigType> = {}

  if (data.key) updateData.key = data.key
  if (data.ttl !== undefined) updateData.ttl = data.ttl
  if (data.max_size !== undefined) updateData.max_size = data.max_size
  if (data.strategy) updateData.strategy = data.strategy
  if (data.is_enabled !== undefined) updateData.is_enabled = data.is_enabled

  return updateData
}

export const mapCreateCacheOperationData = (data: CreateCacheOperationType) => ({
  operation: data.operation,
  patterns: data.patterns
})
