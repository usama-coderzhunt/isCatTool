// Cache Types
export interface CacheConfigType {
  id: number
  key: string
  ttl: number
  max_size?: number
  strategy: 'lru' | 'fifo' | 'lfu'
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface CreateCacheConfigType {
  key: string
  ttl: number
  max_size?: number
  strategy: 'lru' | 'fifo' | 'lfu'
  is_enabled?: boolean
}

export interface UpdateCacheConfigType extends Partial<CreateCacheConfigType> {
  id: number
}

// Cache Statistics Types
export interface CacheStatsType {
  key: string
  hits: number
  misses: number
  size: number
  items: number
  evictions: number
  hit_rate: number
  last_accessed: string
  last_updated: string
}

// Cache Operation Types
export interface CacheOperationType {
  operation: 'invalidate' | 'warm' | 'clear'
  patterns?: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  items_affected: number
  started_at: string
  completed_at?: string
  error_message?: string
}

export interface CreateCacheOperationType {
  operation: 'invalidate' | 'warm' | 'clear'
  patterns?: string[]
}
