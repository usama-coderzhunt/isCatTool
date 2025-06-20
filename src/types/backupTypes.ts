// Backup Types
export interface BackupType {
  id: number
  name: string
  size: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  type: 'full' | 'incremental'
  file_path?: string
  error_message?: string
  created_at: string
  completed_at?: string
  created_by?: number
}

export interface CreateBackupType {
  name: string
  type: 'full' | 'incremental'
}

// Backup Schedule Types
export interface BackupScheduleType {
  id: number
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  retention_days: number
  next_run: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: number
}

export interface CreateBackupScheduleType {
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  retention_days: number
  is_active?: boolean
}

// Backup Verification Types
export interface BackupVerificationType {
  id: number
  backup_id: number
  status: 'pending' | 'in_progress' | 'success' | 'failed'
  verification_type: 'checksum' | 'restore_test'
  error_message?: string
  created_at: string
  completed_at?: string
}
