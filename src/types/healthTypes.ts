// Health Check Types
export interface SystemHealthType {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  memory_usage: {
    total: number
    used: number
    free: number
  }
  cpu_usage: {
    total: number
    system: number
    user: number
  }
  disk_usage: {
    total: number
    used: number
    free: number
  }
  last_checked: string
}

// Service Status Types
export interface ServiceStatusType {
  name: string
  status: 'up' | 'down' | 'degraded'
  latency: number
  last_error?: string
  last_checked: string
  uptime_percentage: number
}

// Performance Metrics Types
export interface PerformanceMetricsType {
  response_times: {
    avg: number
    min: number
    max: number
    p95: number
    p99: number
  }
  request_rates: {
    total: number
    success: number
    error: number
  }
  resource_usage: {
    cpu: number
    memory: number
    disk_io: number
    network_io: number
  }
  timestamp: string
}

// Error Monitoring Types
export interface ErrorLogType {
  id: number
  level: 'error' | 'warning' | 'critical'
  message: string
  stack_trace?: string
  context: Record<string, any>
  frequency: number
  first_seen: string
  last_seen: string
  resolved: boolean
  resolved_at?: string
}
